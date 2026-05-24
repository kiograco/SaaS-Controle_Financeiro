package com.example.finance.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.when;

import com.example.finance.company.Company;
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

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MembershipService membershipService;
    @Mock
    private FinancialTransactionRepository transactionRepository;
    @Mock
    private AccountPayableRepository payableRepository;
    @Mock
    private AccountReceivableRepository receivableRepository;

    private DashboardService service;

    @BeforeEach
    void setUp() {
        service = new DashboardService(membershipService, transactionRepository, payableRepository, receivableRepository);
    }

    @Test
    void shouldIncludeUnlinkedPayablesAndReceivablesInMonthlyTotals() {
        UUID companyId = UUID.randomUUID();
        YearMonth month = YearMonth.of(2026, 5);
        UUID linkedPayableId = UUID.randomUUID();
        UUID linkedReceivableId = UUID.randomUUID();

        when(membershipService.requireCompanyAccess(org.mockito.ArgumentMatchers.eq(companyId), anySet()))
                .thenReturn(new Company());
        when(transactionRepository.findByCompanyIdAndTransactionDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(
                        transaction(TransactionType.INCOME, "100.00"),
                        transaction(TransactionType.EXPENSE, "40.00")));
        when(payableRepository.findByCompanyIdAndDueDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(payable(UUID.randomUUID(), "60.00"), payable(linkedPayableId, "30.00")));
        when(receivableRepository.findByCompanyIdAndDueDateBetween(companyId, month.atDay(1), month.atEndOfMonth()))
                .thenReturn(List.of(receivable(UUID.randomUUID(), "80.00"), receivable(linkedReceivableId, "20.00")));
        when(transactionRepository.findLinkedPayableIdsByCompanyId(companyId)).thenReturn(Set.of(linkedPayableId));
        when(transactionRepository.findLinkedReceivableIdsByCompanyId(companyId)).thenReturn(Set.of(linkedReceivableId));
        when(payableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)))
                .thenReturn(new BigDecimal("15.00"));
        when(receivableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)))
                .thenReturn(new BigDecimal("25.00"));
        when(payableRepository.findByCompanyIdAndDueDateBeforeAndStatusIn(
                org.mockito.ArgumentMatchers.eq(companyId),
                org.mockito.ArgumentMatchers.any(LocalDate.class),
                org.mockito.ArgumentMatchers.anyList()))
                .thenReturn(List.of(payable(UUID.randomUUID(), "1.00"), payable(UUID.randomUUID(), "2.00")));

        Map<String, Object> result = service.dashboard(companyId, month);

        assertThat(result.get("totalReceitas")).isEqualTo(new BigDecimal("180.00"));
        assertThat(result.get("totalDespesas")).isEqualTo(new BigDecimal("100.00"));
        assertThat(result.get("fluxoCaixaMensal")).isEqualTo(new BigDecimal("80.00"));
        assertThat(result.get("contasPagarEmAberto")).isEqualTo(new BigDecimal("15.00"));
        assertThat(result.get("contasReceberEmAberto")).isEqualTo(new BigDecimal("25.00"));
        assertThat(result.get("contasVencidas")).isEqualTo(2);
    }

    private FinancialTransaction transaction(TransactionType type, String amount) {
        FinancialTransaction transaction = new FinancialTransaction();
        transaction.setType(type);
        transaction.setAmount(new BigDecimal(amount));
        return transaction;
    }

    private AccountPayable payable(UUID id, String amount) {
        AccountPayable payable = new AccountPayable();
        payable.setId(id);
        payable.setAmount(new BigDecimal(amount));
        return payable;
    }

    private AccountReceivable receivable(UUID id, String amount) {
        AccountReceivable receivable = new AccountReceivable();
        receivable.setId(id);
        receivable.setAmount(new BigDecimal(amount));
        return receivable;
    }
}
