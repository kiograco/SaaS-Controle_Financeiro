package com.example.finance.user;

import com.example.finance.membership.MembershipService;
import com.example.finance.user.dto.CompanyUserResponse;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyUserService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN);

    private final MembershipService membershipService;

    public List<CompanyUserResponse> list(UUID companyId) {
        return membershipService.listCompanyMemberships(companyId, READ_ROLES).stream()
                .map(membership -> new CompanyUserResponse(
                        membership.getUser().getId(),
                        membership.getUser().getName(),
                        membership.getUser().getEmail(),
                        membership.getUser().isActive(),
                        membership.getRoles()))
                .toList();
    }
}
