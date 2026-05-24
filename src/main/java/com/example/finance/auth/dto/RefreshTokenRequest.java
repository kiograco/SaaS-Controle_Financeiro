package com.example.finance.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(@NotBlank(message = "Informe o refresh token.") String refreshToken) {
}
