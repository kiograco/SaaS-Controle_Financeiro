package com.example.finance.timereport;

import com.example.finance.membership.MembershipService;
import com.example.finance.timereport.dto.MonthlyTimeReportResponse;
import com.example.finance.timesheet.TimeSheetService;
import com.example.finance.user.Role;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeReportService {

    private final MembershipService membershipService;
    private final TimeSheetService timeSheetService;

    @Transactional(readOnly = true)
    public MonthlyTimeReportResponse monthly(UUID companyId, YearMonth month) {
        membershipService.requireCompanyAccess(companyId, Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER));
        var sheets = timeSheetService.listRange(companyId, month.atDay(1), month.atEndOfMonth());
        return new MonthlyTimeReportResponse(
                month,
                (int) sheets.stream()
                        .map(sheet -> sheet.getEmployee() == null ? null : sheet.getEmployee().getId())
                        .filter(java.util.Objects::nonNull)
                        .distinct()
                        .count(),
                sheets.stream().mapToInt(sheet -> sheet.getWorkedMinutes()).sum(),
                sheets.stream().mapToInt(sheet -> sheet.getOvertimeMinutes()).sum(),
                sheets.stream().mapToInt(sheet -> sheet.getMissingMinutes()).sum(),
                sheets.stream()
                        .filter(sheet -> sheet.getEmployee() != null)
                        .collect(java.util.stream.Collectors.groupingBy(sheet -> sheet.getEmployee().getId()))
                        .entrySet().stream()
                        .map(entry -> {
                            var first = entry.getValue().getFirst();
                            return new MonthlyTimeReportResponse.EmployeeMonthlySummary(
                                    first.getEmployee().getId(),
                                    first.getEmployee().getName(),
                                    entry.getValue().stream().mapToInt(v -> v.getWorkedMinutes()).sum(),
                                    entry.getValue().stream().mapToInt(v -> v.getOvertimeMinutes()).sum(),
                                    entry.getValue().stream().mapToInt(v -> v.getMissingMinutes()).sum());
                        }).toList());
    }
}
