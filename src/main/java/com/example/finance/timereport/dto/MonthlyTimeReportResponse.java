package com.example.finance.timereport.dto;

import java.time.YearMonth;
import java.util.List;

public record MonthlyTimeReportResponse(
        YearMonth referencia,
        int totalFuncionarios,
        int totalMinutosTrabalhados,
        int totalHorasExtras,
        int totalMinutosEmFalta,
        List<EmployeeMonthlySummary> funcionarios) {

    public record EmployeeMonthlySummary(
            java.util.UUID employeeId,
            String employeeName,
            int workedMinutes,
            int overtimeMinutes,
            int missingMinutes) {
    }
}
