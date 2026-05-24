package com.example.finance.membership;

import com.example.finance.company.Company;
import com.example.finance.company.CompanyRepository;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.dto.CompanyMembershipResponse;
import com.example.finance.security.SecurityUtils;
import com.example.finance.user.Role;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final CompanyMembershipRepository membershipRepository;
    private final CompanyRepository companyRepository;

    public Company requireCompanyAccess(UUID companyId, Set<Role> acceptedRoles) {
        var principal = SecurityUtils.currentUser();
        if (principal.getGlobalRoles().contains(Role.SUPER_ADMIN)) {
            return companyRepository.findByIdAndActiveTrue(companyId)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Empresa nao encontrada."));
        }
        CompanyMembership membership = membershipRepository.findByUserIdAndCompanyIdAndActiveTrue(principal.getId(), companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "Voce nao possui acesso a esta empresa."));
        boolean allowed = membership.getRoles().stream().anyMatch(acceptedRoles::contains);
        if (!allowed) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Voce nao possui permissao para esta operacao.");
        }
        return membership.getCompany();
    }

    public List<CompanyMembershipResponse> listCurrentUserMemberships() {
        var principal = SecurityUtils.currentUser();
        if (principal.getGlobalRoles().contains(Role.SUPER_ADMIN)) {
            return companyRepository.findAllByActiveTrue().stream()
                    .map(company -> new CompanyMembershipResponse(
                            company.getId(),
                            new CompanyMembershipResponse.CompanySummary(
                                    company.getId(),
                                    company.getLegalName(),
                                    company.getTradeName(),
                                    company.getCnpj(),
                                    company.isActive()),
                            Set.of(Role.SUPER_ADMIN),
                            true))
                    .toList();
        }
        return membershipRepository.findAllByUserIdAndActiveTrue(principal.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CompanyMembership> listCompanyMemberships(UUID companyId, Set<Role> acceptedRoles) {
        requireCompanyAccess(companyId, acceptedRoles);
        return membershipRepository.findAllByCompanyIdAndActiveTrue(companyId);
    }

    private CompanyMembershipResponse toResponse(CompanyMembership membership) {
        var company = membership.getCompany();
        return new CompanyMembershipResponse(
                membership.getId(),
                new CompanyMembershipResponse.CompanySummary(
                        company.getId(),
                        company.getLegalName(),
                        company.getTradeName(),
                        company.getCnpj(),
                        company.isActive()),
                membership.getRoles(),
                membership.isActive());
    }
}
