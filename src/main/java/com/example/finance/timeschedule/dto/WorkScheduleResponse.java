package com.example.finance.timeschedule.dto;

import java.util.UUID;
import java.time.LocalTime;

public record WorkScheduleResponse(
        UUID id,
        String name,
        int expectedDailyMinutes,
        int toleranceMinutes,
        int lunchBreakMinutes,
        LocalTime startTime,
        LocalTime endTime,
        boolean active) {
}
