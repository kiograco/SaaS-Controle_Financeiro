package com.example.finance.payable;

import com.example.finance.audit.AuditService;
import com.example.finance.bankaccount.BankAccountService;
import com.example.finance.category.CategoryService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.costcenter.CostCenterService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.payable.dto.PayableRequest;
import com.example.finance.payable.dto.PayableResponse;
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
public class PayableService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final AccountPayableRepository repository;
    private final MembershipService membershipService;
    private final CategoryService categoryService;
    private final CostCenterService costCenterService;
    private final BankAccountService bankAccountService;
    private final AuditService auditService;

    public PageResponse<PayableResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndDescriptionContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public PayableResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public PayableResponse create(UUID companyId, PayableRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountPayable entity = new AccountPayable();
        apply(companyId, request, entity);
        entity.setCompany(company);
        repository.save(entity);
        auditService.log(company, "CREATE", "PAYABLE", entity.getId(), "Conta a pagar criada.");
        return toResponse(entity);
    }

    @Transactional
    public PayableResponse update(UUID companyId, UUID id, PayableRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountPayable entity = find(companyId, id);
        apply(companyId, request, entity);
        repository.save(entity);
        auditService.log(company, "UPDATE", "PAYABLE", entity.getId(), "Conta a pagar atualizada.");
        return toResponse(entity);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        AccountPayable entity = find(companyId, id);
        entity.setDeletedAt(OffsetDateTime.now());
        repository.save(entity);
        auditService.log(company, "DELETE", "PAYABLE", entity.getId(), "Conta a pagar removida.");
    }

    public AccountPayable find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Conta a pagar nao encontrada."));
    }

    private void apply(UUID companyId, PayableRequest request, AccountPayable entity) {
        entity.setCategory(request.categoryId() == null ? null : categoryService.find(companyId, request.categoryId()));
        entity.setCostCenter(request.costCenterId() == null ? null : costCenterService.find(companyId, request.costCenterId()));
        entity.setBankAccount(request.bankAccountId() == null ? null : bankAccountService.find(companyId, request.bankAccountId()));
        entity.setDescription(request.description());
        entity.setSupplierName(request.supplierName());
        entity.setDueDate(request.dueDate());
        entity.setAmount(request.amount());
        entity.setPaidAmount(request.paidAmount());
        entity.setStatus(request.status());
        entity.setNotes(request.notes());
    }

    private PayableResponse toResponse(AccountPayable entity) {
        return new PayableResponse(entity.getId(),
                entity.getCategory() == null ? null : entity.getCategory().getId(),
                entity.getCostCenter() == null ? null : entity.getCostCenter().getId(),
                entity.getBankAccount() == null ? null : entity.getBankAccount().getId(),
                entity.getDescription(), entity.getSupplierName(), entity.getDueDate(),
                entity.getAmount(), entity.getPaidAmount(), entity.getStatus(), entity.getNotes());
    }
}
