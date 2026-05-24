package com.example.finance.timeschedule.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeWorkScheduleRequest(
        @NotNull(message = "Informe o funcionario.") UUID employeeId,
        @NotNull(message = "Informe a jornada.") UUID workScheduleId,
        @NotNull(message = "Informe a data inicial.") LocalDate startDate) {
}
