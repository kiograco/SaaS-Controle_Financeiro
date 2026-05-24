package com.example.finance.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmployeeRequest(
        @NotBlank(message = "Informe o nome do funcionario.") String name,
        @NotBlank(message = "Informe o CPF do funcionario.") String cpf,
        @Email(message = "Informe um e-mail valido.") String email,
        String registrationNumber,
        String department,
        String position,
        boolean active) {
}
