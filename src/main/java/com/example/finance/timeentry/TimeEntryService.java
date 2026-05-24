package com.example.finance.timeentry;

import com.example.finance.audit.AuditService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.employee.Employee;
import com.example.finance.employee.EmployeeService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.timeentry.dto.TimeEntryRequest;
import com.example.finance.timeentry.dto.TimeEntryResponse;
import com.example.finance.timesheet.TimeSheetService;
import com.example.finance.user.Role;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeEntryService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER);

    private final TimeEntryRepository repository;
    private final EmployeeService employeeService;
    private final MembershipService membershipService;
    private final AuditService auditService;
    private final TimeSheetService timeSheetService;

    public PageResponse<TimeEntryResponse> list(UUID companyId, UUID employeeId, LocalDate startDate, LocalDate endDate, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        Page<TimeEntry> result = employeeId == null
                ? repository.findByCompanyIdAndEntryDateBetween(companyId, startDate, endDate, PageRequest.of(page, size))
                : repository.findByCompanyIdAndEmployeeIdAndEntryDateBetween(companyId, employeeId, startDate, endDate, PageRequest.of(page, size));
        return PageResponse.from(result.map(this::toResponse));
    }

    @Transactional
    public TimeEntryResponse create(UUID companyId, TimeEntryRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        Employee employee = employeeService.find(companyId, request.employeeId());
        repository.findByCompanyIdAndEmployeeIdAndEntryDateAndEntryTimeAndType(companyId, employee.getId(), request.entryDate(),
                        request.entryTime(), request.type())
                .ifPresent(entry -> {
                    throw new BusinessException(HttpStatus.CONFLICT, "Ja existe uma marcacao igual para este funcionario.");
                });
        TimeEntry entry = new TimeEntry();
        entry.setCompany(company);
        entry.setEmployee(employee);
        entry.setEntryDate(request.entryDate());
        entry.setEntryTime(request.entryTime());
        entry.setType(request.type());
        entry.setSource(request.source() == null ? TimeEntrySource.MANUAL : request.source());
        entry.setNotes(request.notes());
        repository.save(entry);
        timeSheetService.recalculate(companyId, employee.getId(), request.entryDate(), request.entryDate());
        auditService.log(company, "CREATE", "TIME_ENTRY", entry.getId(), "Marcacao registrada.");
        return toResponse(entry);
    }

    public java.util.List<TimeEntry> entriesForDay(UUID companyId, UUID employeeId, LocalDate date) {
        return repository.findByCompanyIdAndEmployeeIdAndEntryDate(companyId, employeeId, date);
    }

    private TimeEntryResponse toResponse(TimeEntry entity) {
        return new TimeEntryResponse(entity.getId(), entity.getEmployee().getId(), entity.getEmployee().getName(),
                entity.getEntryDate(), entity.getEntryTime(), entity.getType(), entity.getSource(), entity.getNotes());
    }
}
