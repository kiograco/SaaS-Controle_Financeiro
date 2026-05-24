package com.example.finance.costcenter.dto;

import jakarta.validation.constraints.NotBlank;

public record CostCenterRequest(
        @NotBlank(message = "Informe o nome do centro de custo.") String name,
        @NotBlank(message = "Informe o codigo do centro de custo.") String code,
        boolean active) {
}
