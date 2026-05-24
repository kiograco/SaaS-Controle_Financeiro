package com.example.finance.category.dto;

import com.example.finance.category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @NotBlank(message = "Informe o nome da categoria.") String name,
        String description,
        @NotNull(message = "Informe o tipo da categoria.") CategoryType type,
        boolean active) {
}
