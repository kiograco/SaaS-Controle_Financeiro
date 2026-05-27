package com.example.finance.timeschedule.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;

public record WorkScheduleRequest(
        @NotBlank(message = "Informe o nome da jornada.") String name,
        @NotEmpty(message = "Informe os dias da semana da jornada.") List<DayOfWeek> workingDays,
        @Min(value = 1, message = "Informe a quantidade esperada de minutos diarios.") int expectedDailyMinutes,
        @Min(value = 0, message = "A tolerancia nao pode ser negativa.") int toleranceMinutes,
        @Min(value = 0, message = "O intervalo de almoco nao pode ser negativo.") int lunchBreakMinutes,
        @NotNull(message = "Informe o horario de entrada.") LocalTime startTime,
        @NotNull(message = "Informe o horario de saida.") LocalTime endTime,
        boolean active) {

    public WorkScheduleRequest {
        if (workingDays == null) {
            workingDays = List.of(
                    DayOfWeek.MONDAY,
                    DayOfWeek.TUESDAY,
                    DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY,
                    DayOfWeek.FRIDAY);
        }
    }
}
