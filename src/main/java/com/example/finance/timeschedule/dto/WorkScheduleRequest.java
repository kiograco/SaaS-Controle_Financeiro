package com.example.finance.timeschedule.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record WorkScheduleRequest(
        @NotBlank(message = "Informe o nome da jornada.") String name,
        @Min(value = 1, message = "Informe a quantidade esperada de minutos diarios.") int expectedDailyMinutes,
        @Min(value = 0, message = "A tolerancia nao pode ser negativa.") int toleranceMinutes,
        @Min(value = 0, message = "O intervalo de almoco nao pode ser negativo.") int lunchBreakMinutes,
        boolean active) {
}
