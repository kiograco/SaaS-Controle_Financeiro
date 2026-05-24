package com.example.finance.company.dto;

import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String legalName,
        String tradeName,
        String cnpj,
        boolean active) {
}
