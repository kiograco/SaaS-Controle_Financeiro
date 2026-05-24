package com.example.finance.transaction;

import com.example.finance.audit.AuditService;
import com.example.finance.bankaccount.BankAccount;
import com.example.finance.bankaccount.BankAccountService;
import com.example.finance.common.dto.PageResponse;
import com.example.finance.category.CategoryService;
import com.example.finance.costcenter.CostCenterService;
import com.example.finance.exception.BusinessException;
import com.example.finance.membership.MembershipService;
import com.example.finance.payable.PayableService;
import com.example.finance.receivable.ReceivableService;
import com.example.finance.transaction.dto.TransactionRequest;
import com.example.finance.transaction.dto.TransactionResponse;
import com.example.finance.user.Role;
import java.math.BigDecimal;
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
public class TransactionService {

    private static final Set<Role> READ_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER);
    private static final Set<Role> WRITE_ROLES = Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER);

    private final FinancialTransactionRepository repository;
    private final MembershipService membershipService;
    private final CategoryService categoryService;
    private final CostCenterService costCenterService;
    private final BankAccountService bankAccountService;
    private final PayableService payableService;
    private final ReceivableService receivableService;
    private final AuditService auditService;

    public PageResponse<TransactionResponse> list(UUID companyId, String search, int page, int size) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return PageResponse.from(repository.findByCompanyIdAndDescriptionContainingIgnoreCase(companyId, search == null ? "" : search,
                PageRequest.of(page, size)).map(this::toResponse));
    }

    public TransactionResponse get(UUID companyId, UUID id) {
        membershipService.requireCompanyAccess(companyId, READ_ROLES);
        return toResponse(find(companyId, id));
    }

    @Transactional
    public TransactionResponse create(UUID companyId, TransactionRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        FinancialTransaction entity = new FinancialTransaction();
        apply(companyId, request, entity);
        entity.setCompany(company);
        repository.save(entity);
        updateBalance(entity.getBankAccount(), entity.getType(), entity.getAmount(), true);
        auditService.log(company, "CREATE", "TRANSACTION", entity.getId(), "Lancamento financeiro criado.");
        return toResponse(entity);
    }

    @Transactional
    public TransactionResponse update(UUID companyId, UUID id, TransactionRequest request) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        FinancialTransaction entity = find(companyId, id);
        updateBalance(entity.getBankAccount(), entity.getType(), entity.getAmount(), false);
        apply(companyId, request, entity);
        repository.save(entity);
        updateBalance(entity.getBankAccount(), entity.getType(), entity.getAmount(), true);
        auditService.log(company, "UPDATE", "TRANSACTION", entity.getId(), "Lancamento financeiro atualizado.");
        return toResponse(entity);
    }

    @Transactional
    public void delete(UUID companyId, UUID id) {
        var company = membershipService.requireCompanyAccess(companyId, WRITE_ROLES);
        FinancialTransaction entity = find(companyId, id);
        updateBalance(entity.getBankAccount(), entity.getType(), entity.getAmount(), false);
        entity.setDeletedAt(OffsetDateTime.now());
        repository.save(entity);
        auditService.log(company, "DELETE", "TRANSACTION", entity.getId(), "Lancamento financeiro removido.");
    }

    public FinancialTransaction find(UUID companyId, UUID id) {
        return repository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Lancamento financeiro nao encontrado."));
    }

    private void apply(UUID companyId, TransactionRequest request, FinancialTransaction entity) {
        entity.setCategory(request.categoryId() == null ? null : categoryService.find(companyId, request.categoryId()));
        entity.setCostCenter(request.costCenterId() == null ? null : costCenterService.find(companyId, request.costCenterId()));
        entity.setBankAccount(bankAccountService.find(companyId, request.bankAccountId()));
        entity.setPayable(request.payableId() == null ? null : payableService.find(companyId, request.payableId()));
        entity.setReceivable(request.receivableId() == null ? null : receivableService.find(companyId, request.receivableId()));
        entity.setDescription(request.description());
        entity.setTransactionDate(request.transactionDate());
        entity.setType(request.type());
        entity.setAmount(request.amount());
        entity.setNotes(request.notes());
    }

    private void updateBalance(BankAccount account, TransactionType type, BigDecimal amount, boolean add) {
        int signal = add ? 1 : -1;
        BigDecimal delta = switch (type) {
            case INCOME -> amount.multiply(BigDecimal.valueOf(signal));
            case EXPENSE -> amount.multiply(BigDecimal.valueOf(-signal));
            case TRANSFER -> BigDecimal.ZERO;
        };
        account.setBalance(account.getBalance().add(delta));
    }

    private TransactionResponse toResponse(FinancialTransaction entity) {
        return new TransactionResponse(entity.getId(),
                entity.getCategory() == null ? null : entity.getCategory().getId(),
                entity.getCostCenter() == null ? null : entity.getCostCenter().getId(),
                entity.getBankAccount().getId(),
                entity.getPayable() == null ? null : entity.getPayable().getId(),
                entity.getReceivable() == null ? null : entity.getReceivable().getId(),
                entity.getDescription(), entity.getTransactionDate(), entity.getType(), entity.getAmount(), entity.getNotes());
    }
}
