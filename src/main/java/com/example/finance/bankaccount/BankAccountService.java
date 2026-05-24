package com.example.finance.bankaccount;

import com.example.finance.audit.AuditService;
import com.example.finance.bankaccount.dto.BankAccountRequest;
import com.example.finance.bankaccount.dto.BankAccountResponse;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.user.Role;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final BankAccountRepository repository;
    private final MembershipService membershipService;
    private final AuditService auditService;

    public PageResponse<BankAccountResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndNameContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public BankAccountResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public BankAccountResponse create(UUID companyId, BankAccountRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        BankAccount entity = new BankAccount();
        apply(request, entity);
        entity.setCompany(company);
        repository.save(entity);
        auditService.log(company, "CREATE", "BANK_ACCOUNT", entity.getId(), "Conta bancaria criada.");
        return toResponse(entity);
    }

    @Transactional
    public BankAccountResponse update(UUID companyId, UUID id, BankAccountRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        BankAccount entity = find(companyId, id);
        apply(request, entity);
        repository.save(entity);
        auditService.log(company, "UPDATE", "BANK_ACCOUNT", entity.getId(), "Conta bancaria atualizada.");
        return toResponse(entity);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        BankAccount entity = find(companyId, id);
        entity.setDeletedAt(OffsetDateTime.now());
        repository.save(entity);
        auditService.log(company, "DELETE", "BANK_ACCOUNT", entity.getId(), "Conta bancaria removida.");
    }

    public BankAccount find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Conta bancaria nao encontrada."));
    }

    private void apply(BankAccountRequest request, BankAccount entity) {
        entity.setName(request.name());
        entity.setBankName(request.bankName());
        entity.setBranchNumber(request.branchNumber());
        entity.setAccountNumber(request.accountNumber());
        entity.setBalance(request.balance());
        entity.setActive(request.active());
    }

    private BankAccountResponse toResponse(BankAccount entity) {
        return new BankAccountResponse(entity.getId(), entity.getName(), entity.getBankName(), entity.getBranchNumber(),
                entity.getAccountNumber(), entity.getBalance(), entity.isActive());
    }
}
