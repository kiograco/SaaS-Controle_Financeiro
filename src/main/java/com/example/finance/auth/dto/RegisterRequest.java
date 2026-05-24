package com.example.finance.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Informe o nome do usuario.") String name,
        @Email(message = "Informe um e-mail valido.") @NotBlank(message = "Informe o e-mail.") String email,
        @NotBlank(message = "Informe a senha.") String password) {
}
