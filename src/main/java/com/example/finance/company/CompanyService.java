package com.example.finance.company;

import com.example.finance.audit.AuditService;
import com.example.finance.company.dto.CompanyCreateRequest;
import com.example.finance.company.dto.CompanyResponse;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.CompanyMembership;
import com.example.finance.membership.CompanyMembershipRepository;
import com.example.finance.security.SecurityUtils;
import com.example.finance.user.Role;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final AuditService auditService;

    @Transactional
    public CompanyResponse create(CompanyCreateRequest request) {
        String sanitizedCnpj = request.cnpj().replaceAll("\\D", "");
        if (companyRepository.existsByCnpj(sanitizedCnpj)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Ja existe uma empresa com este CNPJ.");
        }

        Company company = new Company();
        company.setLegalName(request.legalName().trim());
        company.setTradeName(request.tradeName().trim());
        company.setCnpj(sanitizedCnpj);
        company.setActive(true);
        company = companyRepository.saveAndFlush(company);

        CompanyMembership membership = new CompanyMembership();
        membership.setCompany(company);
        membership.setUser(SecurityUtils.currentUser().getUser());
        membership.setActive(true);
        membership.setRoles(Set.of(Role.COMPANY_ADMIN));
        membershipRepository.save(membership);

        auditService.log(company, "CREATE", "COMPANY", company.getId(), "Empresa criada.");
        return toResponse(company);
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getLegalName(),
                company.getTradeName(),
                company.getCnpj(),
                company.isActive());
    }
}
