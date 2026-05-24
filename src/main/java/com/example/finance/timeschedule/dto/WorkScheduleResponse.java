package com.example.finance.timeschedule.dto;

import java.util.UUID;

public record WorkScheduleResponse(
        UUID id,
        String name,
        int expectedDailyMinutes,
        int toleranceMinutes,
        int lunchBreakMinutes,
        boolean active) {
}
