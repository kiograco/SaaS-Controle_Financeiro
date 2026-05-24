package com.example.finance.costcenter.dto;

import java.util.UUID;

public record CostCenterResponse(UUID id, String name, String code, boolean active) {
}
