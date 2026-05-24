package com.example.finance.membership.dto;

import com.example.finance.user.Role;
import java.util.Set;
import java.util.UUID;

public record CompanyMembershipResponse(
        UUID id,
        CompanySummary company,
        Set<Role> roles,
        boolean active) {

    public record CompanySummary(
            UUID id,
            String legalName,
            String tradeName,
            String cnpj,
            boolean active) {
    }
}
