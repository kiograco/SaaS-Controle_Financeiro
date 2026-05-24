package com.example.finance.category.dto;

import com.example.finance.category.CategoryType;
import java.util.UUID;

public record CategoryResponse(UUID id, String name, String description, CategoryType type, boolean active) {
}
