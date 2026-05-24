package com.example.finance.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CompanyCreateRequest(
        @NotBlank(message = "Informe a razao social.") String legalName,
        @NotBlank(message = "Informe o nome fantasia.") String tradeName,
        @NotBlank(message = "Informe o CNPJ.")
        @Pattern(regexp = "\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", message = "Informe um CNPJ valido.")
        String cnpj) {
}
