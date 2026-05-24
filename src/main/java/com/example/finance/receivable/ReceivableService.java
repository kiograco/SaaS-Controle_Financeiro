package com.example.finance.receivable;

import com.example.finance.audit.AuditService;
import com.example.finance.bankaccount.BankAccountService;
import com.example.finance.category.CategoryService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.costcenter.CostCenterService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.receivable.dto.ReceivableRequest;
import com.example.finance.receivable.dto.ReceivableResponse;
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
public class ReceivableService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final AccountReceivableRepository repository;
    private final MembershipService membershipService;
    private final CategoryService categoryService;
    private final CostCenterService costCenterService;
    private final BankAccountService bankAccountService;
    private final AuditService auditService;

    public PageResponse<ReceivableResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndDescriptionContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public ReceivableResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public ReceivableResponse create(UUID companyId, ReceivableRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountReceivable entity = new AccountReceivable();
        apply(companyId, request, entity);
        entity.setCompany(company);
        repository.save(entity);
        auditService.log(company, "CREATE", "RECEIVABLE", entity.getId(), "Conta a receber criada.");
        return toResponse(entity);
    }

    @Transactional
    public ReceivableResponse update(UUID companyId, UUID id, ReceivableRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountReceivable entity = find(companyId, id);
        apply(companyId, request, entity);
        repository.save(entity);
        auditService.log(company, "UPDATE", "RECEIVABLE", entity.getId(), "Conta a receber atualizada.");
        return toResponse(entity);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountReceivable entity = find(companyId, id);
        entity.setDeletedAt(OffsetDateTime.now());
        repository.save(entity);
        auditService.log(company, "DELETE", "RECEIVABLE", entity.getId(), "Conta a receber removida.");
    }

    public AccountReceivable find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Conta a receber nao encontrada."));
    }

    private void apply(UUID companyId, ReceivableRequest request, AccountReceivable entity) {
        entity.setCategory(request.categoryId() == null ? null : categoryService.find(companyId, request.categoryId()));
        entity.setCostCenter(request.costCenterId() == null ? null : costCenterService.find(companyId, request.costCenterId()));
        entity.setBankAccount(request.bankAccountId() == null ? null : bankAccountService.find(companyId, request.bankAccountId()));
        entity.setDescription(request.description());
        entity.setCustomerName(request.customerName());
        entity.setDueDate(request.dueDate());
        entity.setAmount(request.amount());
        entity.setReceivedAmount(request.receivedAmount());
        entity.setStatus(request.status());
        entity.setNotes(request.notes());
    }

    private ReceivableResponse toResponse(AccountReceivable entity) {
        return new ReceivableResponse(entity.getId(),
                entity.getCategory() == null ? null : entity.getCategory().getId(),
                entity.getCostCenter() == null ? null : entity.getCostCenter().getId(),
                entity.getBankAccount() == null ? null : entity.getBankAccount().getId(),
                entity.getDescription(), entity.getCustomerName(), entity.getDueDate(),
                entity.getAmount(), entity.getReceivedAmount(), entity.getStatus(), entity.getNotes());
    }
}
