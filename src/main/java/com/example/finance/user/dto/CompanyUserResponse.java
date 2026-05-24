package com.example.finance.user.dto;

import com.example.finance.user.Role;
import java.util.Set;
import java.util.UUID;

public record CompanyUserResponse(
        UUID id,
        String name,
        String email,
        boolean active,
        Set<Role> roles) {
}
