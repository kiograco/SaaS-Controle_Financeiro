package com.example.finance.dashboard;

import com.example.finance.membership.MembershipService;
import com.example.finance.payable.AccountPayableRepository;
import com.example.finance.receivable.AccountReceivable;
import com.example.finance.payable.DocumentStatus;
import com.example.finance.payable.AccountPayable;
import com.example.finance.receivable.AccountReceivableRepository;
import com.example.finance.transaction.FinancialTransaction;
import com.example.finance.transaction.FinancialTransactionRepository;
import com.example.finance.transaction.TransactionType;
import com.example.finance.user.Role;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final MembershipService membershipService;
    private final FinancialTransactionRepository transactionRepository;
    private final AccountPayableRepository payableRepository;
    private final AccountReceivableRepository receivableRepository;

    public DashboardService(MembershipService membershipService,
                            FinancialTransactionRepository transactionRepository,
                            AccountPayableRepository payableRepository,
                            AccountReceivableRepository receivableRepository) {
        this.membershipService = membershipService;
        this.transactionRepository = transactionRepository;
        this.payableRepository = payableRepository;
        this.receivableRepository = receivableRepository;
    }

    public Map<String, Object> dashboard(UUID companyId, YearMonth month) {
        membershipService.requireCompanyAccess(companyId, Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER));
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<FinancialTransaction> transactions = transactionRepository.findByCompanyIdAndTransactionDateBetween(companyId, start, end);
        List<AccountPayable> payables = payableRepository.findByCompanyIdAndDueDateBetween(companyId, start, end);
        List<AccountReceivable> receivables = receivableRepository.findByCompanyIdAndDueDateBetween(companyId, start, end);
        Set<UUID> linkedPayableIds = transactionRepository.findLinkedPayableIdsByCompanyId(companyId);
        Set<UUID> linkedReceivableIds = transactionRepository.findLinkedReceivableIdsByCompanyId(companyId);

        BigDecimal totalIncome = sumByType(transactions, TransactionType.INCOME)
                .add(sumReceivables(receivables, linkedReceivableIds));
        BigDecimal totalExpense = sumByType(transactions, TransactionType.EXPENSE)
                .add(sumPayables(payables, linkedPayableIds));
        return Map.of(
                "mesReferencia", month.toString(),
                "fluxoCaixaMensal", totalIncome.subtract(totalExpense),
                "totalReceitas", totalIncome,
                "totalDespesas", totalExpense,
                "contasPagarEmAberto", payableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)),
                "contasReceberEmAberto", receivableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)),
                "contasVencidas", payableRepository.findByCompanyIdAndDueDateBeforeAndStatusIn(companyId, LocalDate.now(),
                        List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)).size());
    }

    private BigDecimal sumByType(List<FinancialTransaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(FinancialTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumPayables(List<AccountPayable> payables, Set<UUID> linkedPayableIds) {
        return payables.stream()
                .filter(payable -> !linkedPayableIds.contains(payable.getId()))
                .map(AccountPayable::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumReceivables(List<AccountReceivable> receivables, Set<UUID> linkedReceivableIds) {
        return receivables.stream()
                .filter(receivable -> !linkedReceivableIds.contains(receivable.getId()))
                .map(AccountReceivable::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
