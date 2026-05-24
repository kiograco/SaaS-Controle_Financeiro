package com.example.finance.timesheet.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record RecalculateTimeSheetRequest(
        @NotNull(message = "Informe o funcionario.") UUID employeeId,
        @NotNull(message = "Informe a data inicial.") LocalDate startDate,
        @NotNull(message = "Informe a data final.") LocalDate endDate) {
}
