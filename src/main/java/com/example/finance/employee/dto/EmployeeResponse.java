package com.example.finance.employee.dto;

import java.util.UUID;

public record EmployeeResponse(
        UUID id,
        String name,
        String cpf,
        String email,
        String registrationNumber,
        String department,
        String position,
        boolean active) {
}
