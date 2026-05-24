package com.example.finance.timeentry.dto;

import com.example.finance.timeentry.TimeEntrySource;
import com.example.finance.timeentry.TimeEntryType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record TimeEntryRequest(
        @NotNull(message = "Informe o funcionario.") UUID employeeId,
        @NotNull(message = "Informe a data da marcacao.") LocalDate entryDate,
        @NotNull(message = "Informe o horario da marcacao.") LocalTime entryTime,
        @NotNull(message = "Informe o tipo da marcacao.") TimeEntryType type,
        TimeEntrySource source,
        String notes) {
}
