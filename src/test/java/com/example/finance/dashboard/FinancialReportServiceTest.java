package com.example.finance.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.when;

import com.example.finance.bankaccount.BankAccount;
import com.example.finance.bankaccount.BankAccountRepository;
import com.example.finance.category.Category;
import com.example.finance.company.Company;
import com.example.finance.costcenter.CostCenter;
import com.example.finance.membership.MembershipService;
import com.example.finance.payable.AccountPayable;
import com.example.finance.payable.AccountPayableRepository;
import com.example.finance.payable.DocumentStatus;
import com.example.finance.receivable.AccountReceivable;
import com.example.finance.receivable.AccountReceivableRepository;
import com.example.finance.transaction.FinancialTransaction;
import com.example.finance.transaction.FinancialTransactionRepository;
import com.example.finance.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class FinancialReportServiceTest {

    @Mock
    private MembershipService membershipService;
    @Mock
    private FinancialTransactionRepository transactionRepository;
    @Mock
    private AccountPayableRepository payableRepository;
    @Mock
    private AccountReceivableRepository receivableRepository;
    @Mock
    private BankAccountRepository bankAccountRepository;

    private FinancialReportService service;

    @BeforeEach
    void setUp() {
        service = new FinancialReportService(
                membershipService,
                transactionRepository,
                payableRepository,
                receivableRepository,
                bankAccountRepository);
    }

    @Test
    void shouldIncludeUnlinkedDocumentsInFinancialReport() {
        UUID companyId = UUID.randomUUID();
        YearMonth month = YearMonth.of(2026, 5);
        UUID linkedPayableId = UUID.randomUUID();
        UUID linkedReceivableId = UUID.randomUUID();

        when(membershipService.requireCompanyAccess(org.mockito.ArgumentMatchers.eq(companyId), anySet()))
                .thenReturn(new Company());
        when(transactionRepository.findByCompanyIdAndTransactionDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(
                        transaction(TransactionType.INCOME, "100.00", null, costCenter("Operacoes")),
                        transaction(TransactionType.EXPENSE, "40.00", category("Despesa Fixa"), costCenter("Operacoes"))));
        when(payableRepository.findByCompanyIdAndDueDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(
                        payable(UUID.randomUUID(), "60.00", category("Infra"), costCenter("Operacoes")),
                        payable(linkedPayableId, "30.00", category("Ignorar"), costCenter("Ignorar"))));
        when(receivableRepository.findByCompanyIdAndDueDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(
                        receivable(UUID.randomUUID(), "80.00", costCenter("Comercial")),
                        receivable(linkedReceivableId, "20.00", costCenter("Ignorar"))));
        when(transactionRepository.findLinkedPayableIdsByCompanyId(companyId)).thenReturn(Set.of(linkedPayableId));
        when(transactionRepository.findLinkedReceivableIdsByCompanyId(companyId)).thenReturn(Set.of(linkedReceivableId));
        when(bankAccountRepository.findByCompanyIdAndNameContainingIgnoreCase(companyId, "", Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(bankAccount("Conta Principal", "250.00"))));
        when(payableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)))
                .thenReturn(new BigDecimal("15.00"));
        when(receivableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)))
                .thenReturn(new BigDecimal("25.00"));
        when(payableRepository.findByCompanyIdAndDueDateBeforeAndStatusIn(
                org.mockito.ArgumentMatchers.eq(companyId),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.anyList()))
                .thenReturn(List.of(payable(UUID.randomUUID(), "1.00", null, null)));

        Map<String, Object> result = service.monthly(companyId, month);

        assertThat(result.get("totalIncome")).isEqualTo(new BigDecimal("180.00"));
        assertThat(result.get("totalExpenses")).isEqualTo(new BigDecimal("100.00"));
        assertThat(result.get("monthlyCashFlow")).isEqualTo(new BigDecimal("80.00"));
        assertThat(result.get("balanceByBankAccount")).isEqualTo(Map.of("Conta Principal", new BigDecimal("250.00")));
        assertThat(result.get("expenseSummaryByCategory")).isEqualTo(Map.of(
                "Despesa Fixa", new BigDecimal("40.00"),
                "Infra", new BigDecimal("60.00")));
        assertThat(result.get("summaryByCostCenter")).isEqualTo(Map.of(
                "Operacoes", new BigDecimal("200.00"),
                "Comercial", new BigDecimal("80.00")));
    }

    private FinancialTransaction transaction(TransactionType type, String amount, Category category, CostCenter costCenter) {
        FinancialTransaction transaction = new FinancialTransaction();
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        transaction.setCategory(category);
        transaction.setCostCenter(costCenter);
        return transaction;
    }

    private AccountPayable payable(UUID id, String amount, Category category, CostCenter costCenter) {
        AccountPayable payable = new AccountPayable();
        payable.setId(id);
        payable.setAmount(new BigDecimal(amount));
        payable.setCategory(category);
        payable.setCostCenter(costCenter);
        return payable;
    }

    private AccountReceivable receivable(UUID id, String amount, CostCenter costCenter) {
        AccountReceivable receivable = new AccountReceivable();
        receivable.setId(id);
        receivable.setAmount(new BigDecimal(amount));
        receivable.setCostCenter(costCenter);
        return receivable;
    }

    private Category category(String name) {
        Category category = new Category();
        category.setName(name);
        return category;
    }

    private CostCenter costCenter(String name) {
        CostCenter costCenter = new CostCenter();
        costCenter.setName(name);
        return costCenter;
    }

    private BankAccount bankAccount(String name, String balance) {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setName(name);
        bankAccount.setBalance(new BigDecimal(balance));
        return bankAccount;
    }
}
