package com.example.finance.timeschedule.dto;

import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public record WorkScheduleResponse(
        UUID id,
        String name,
        List<DayOfWeek> workingDays,
        int expectedDailyMinutes,
        int toleranceMinutes,
        int lunchBreakMinutes,
        LocalTime startTime,
        LocalTime endTime,
        boolean active) {
}
