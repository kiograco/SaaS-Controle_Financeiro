package com.example.finance.timeentry.dto;

import com.example.finance.timeentry.TimeEntrySource;
import com.example.finance.timeentry.TimeEntryType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record TimeEntryResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        LocalDate entryDate,
        LocalTime entryTime,
        TimeEntryType type,
        TimeEntrySource source,
        String notes) {
}
