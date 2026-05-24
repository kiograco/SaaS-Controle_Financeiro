package com.example.finance.timesheet.dto;

import com.example.finance.timesheet.TimeSheetStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TimeSheetResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        LocalDate referenceDate,
        int workedMinutes,
        int overtimeMinutes,
        int missingMinutes,
        TimeSheetStatus status,
        OffsetDateTime calculatedAt) {
}
