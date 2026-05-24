package com.example.finance.timesheet;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.employee.Employee;
import com.example.finance.employee.EmployeeService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.timeentry.TimeEntry;
import com.example.finance.timeentry.TimeEntryRepository;
import com.example.finance.timeentry.TimeEntryType;
import com.example.finance.timeschedule.EmployeeWorkSchedule;
import com.example.finance.timeschedule.WorkScheduleService;
import com.example.finance.timesheet.dto.RecalculateTimeSheetRequest;
import com.example.finance.timesheet.dto.TimeSheetResponse;
import com.example.finance.user.Role;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeSheetService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER);
    private static final int DEFAULT_EXPECTED_DAILY_MINUTES = 8 * 60;
    private static final int DEFAULT_LUNCH_BREAK_MINUTES = 2 * 60;

    private final TimeSheetRepository repository;
    private final MembershipService membershipService;
    private final EmployeeService employeeService;
    private final WorkScheduleService workScheduleService;
    private final TimeEntryRepository timeEntryRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PageResponse<TimeSheetResponse> list(UUID companyId, LocalDate startDate, LocalDate endDate, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndReferenceDateBetween(companyId, startDate, endDate, PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Transactional
    public void recalculate(UUID companyId, RecalculateTimeSheetRequest request) {
        membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        recalculate(companyId, request.employeeId(), request.startDate(), request.endDate());
    }

    @Transactional
    public void recalculate(UUID companyId, UUID employeeId, LocalDate startDate, LocalDate endDate) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Employee employee = employeeService.find(companyId, employeeId);
        List<LocalDate> dates = startDate.datesUntil(endDate.plusDays(1)).toList();
        for (LocalDate date : dates) {
            List<TimeEntry> entries = new ArrayList<>(timeEntryRepository.findByCompanyIdAndEmployeeIdAndEntryDate(companyId, employeeId, date));
            entries.sort(Comparator.comparing(TimeEntry::getEntryTime));
            EmployeeWorkSchedule assignment = currentAssignmentOrNull(companyId, employeeId, date);
            int expectedMinutes = assignment == null ? DEFAULT_EXPECTED_DAILY_MINUTES : assignment.getWorkSchedule().getExpectedDailyMinutes();
            int lunchBreakMinutes = assignment == null ? DEFAULT_LUNCH_BREAK_MINUTES : assignment.getWorkSchedule().getLunchBreakMinutes();
            int toleranceMinutes = assignment == null ? 0 : assignment.getWorkSchedule().getToleranceMinutes();
            int workedMinutes = calculateWorkedMinutes(entries, lunchBreakMinutes);
            int diff = workedMinutes - expectedMinutes;

            TimeSheet sheet = repository.findByCompanyIdAndEmployeeIdAndReferenceDate(companyId, employeeId, date)
                    .orElseGet(TimeSheet::new);
            sheet.setCompany(company);
            sheet.setEmployee(employee);
            sheet.setReferenceDate(date);
            sheet.setWorkedMinutes(workedMinutes);
            sheet.setOvertimeMinutes(Math.max(diff, 0));
            sheet.setMissingMinutes(Math.max(-diff, 0));
            sheet.setStatus(resolveStatus(entries, diff, toleranceMinutes, assignment == null));
            sheet.setCalculatedAt(OffsetDateTime.now());
            repository.save(sheet);
        }
        auditService.log(company, "RECALCULATE", "TIME_SHEET", employee.getId(), "Espelho de ponto recalculado.");
    }

    public List<TimeSheet> listRange(UUID companyId, LocalDate startDate, LocalDate endDate) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return repository.findByCompanyIdAndReferenceDateBetween(companyId, startDate, endDate);
    }

    private int calculateWorkedMinutes(List<TimeEntry> entries, int fallbackLunchBreakMinutes) {
        if (entries.isEmpty()) {
            return 0;
        }
        var clockIn = entries.stream().filter(e -> e.getType() == TimeEntryType.CLOCK_IN).findFirst();
        var lunchStart = entries.stream().filter(e -> e.getType() == TimeEntryType.LUNCH_START).findFirst();
        var lunchEnd = entries.stream().filter(e -> e.getType() == TimeEntryType.LUNCH_END).findFirst();
        var clockOut = entries.stream().filter(e -> e.getType() == TimeEntryType.CLOCK_OUT).reduce((a, b) -> b);
        if (clockIn.isEmpty() || clockOut.isEmpty()) {
            return 0;
        }
        long minutes = ChronoUnit.MINUTES.between(clockIn.get().getEntryTime(), clockOut.get().getEntryTime());
        if (lunchStart.isPresent() && lunchEnd.isPresent()) {
            minutes -= ChronoUnit.MINUTES.between(lunchStart.get().getEntryTime(), lunchEnd.get().getEntryTime());
        } else if (fallbackLunchBreakMinutes > 0) {
            minutes -= fallbackLunchBreakMinutes;
        }
        return (int) Math.max(minutes, 0);
    }

    private TimeSheetStatus resolveStatus(List<TimeEntry> entries, int diff, int toleranceMinutes, boolean missingAssignment) {
        if (entries.isEmpty()) {
            return TimeSheetStatus.ABSENT;
        }
        if (missingAssignment) {
            return TimeSheetStatus.MANUAL_REVIEW;
        }
        boolean incomplete = entries.stream().noneMatch(entry -> entry.getType() == TimeEntryType.CLOCK_OUT);
        if (incomplete) {
            return TimeSheetStatus.INCOMPLETE;
        }
        if (Math.abs(diff) <= toleranceMinutes) {
            return TimeSheetStatus.NORMAL;
        }
        if (diff > 0) {
            return TimeSheetStatus.OVERTIME;
        }
        return TimeSheetStatus.MANUAL_REVIEW;
    }

    private EmployeeWorkSchedule currentAssignmentOrNull(UUID companyId, UUID employeeId, LocalDate date) {
        try {
            return workScheduleService.currentAssignment(companyId, employeeId, date);
        } catch (BusinessException ex) {
            return null;
        }
    }

    private TimeSheetResponse toResponse(TimeSheet sheet) {
        UUID employeeId = sheet.getEmployee() == null ? null : sheet.getEmployee().getId();
        String employeeName = sheet.getEmployee() == null ? "Funcionario removido" : sheet.getEmployee().getName();
        return new TimeSheetResponse(sheet.getId(), employeeId, employeeName,
                sheet.getReferenceDate(), sheet.getWorkedMinutes(), sheet.getOvertimeMinutes(),
                sheet.getMissingMinutes(), sheet.getStatus(), sheet.getCalculatedAt());
    }
}
