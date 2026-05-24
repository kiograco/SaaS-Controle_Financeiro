package com.example.finance.dashboard;

import com.example.finance.bankaccount.BankAccountRepository;
import com.example.finance.membership.MembershipService;
import com.example.finance.payable.AccountPayable;
import com.example.finance.payable.AccountPayableRepository;
import com.example.finance.payable.DocumentStatus;
import com.example.finance.receivable.AccountReceivable;
import com.example.finance.receivable.AccountReceivableRepository;
import com.example.finance.transaction.FinancialTransaction;
import com.example.finance.transaction.FinancialTransactionRepository;
import com.example.finance.transaction.TransactionType;
import com.example.finance.user.Role;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class FinancialReportService {

    private final MembershipService membershipService;
    private final FinancialTransactionRepository transactionRepository;
    private final AccountPayableRepository payableRepository;
    private final AccountReceivableRepository receivableRepository;
    private final BankAccountRepository bankAccountRepository;

    public FinancialReportService(MembershipService membershipService,
                                  FinancialTransactionRepository transactionRepository,
                                  AccountPayableRepository payableRepository,
                                  AccountReceivableRepository receivableRepository,
                                  BankAccountRepository bankAccountRepository) {
        this.membershipService = membershipService;
        this.transactionRepository = transactionRepository;
        this.payableRepository = payableRepository;
        this.receivableRepository = receivableRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    public Map<String, Object> monthly(UUID companyId, YearMonth month) {
        membershipService.requireCompanyAccess(companyId, Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER, Role.FINANCE_VIEWER));
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        List<FinancialTransaction> transactions = transactionRepository.findByCompanyIdAndTransactionDateBetween(companyId, start, end);
        List<AccountPayable> payables = payableRepository.findByCompanyIdAndDueDateBetween(companyId, start, end);
        List<AccountReceivable> receivables = receivableRepository.findByCompanyIdAndDueDateBetween(companyId, start, end);
        Set<UUID> linkedPayableIds = transactionRepository.findLinkedPayableIdsByCompanyId(companyId);
        Set<UUID> linkedReceivableIds = transactionRepository.findLinkedReceivableIdsByCompanyId(companyId);

        Map<String, BigDecimal> byBank = new LinkedHashMap<>();
        bankAccountRepository.findByCompanyIdAndNameContainingIgnoreCase(companyId, "", org.springframework.data.domain.Pageable.unpaged())
                .forEach(account -> byBank.put(account.getName(), account.getBalance()));

        BigDecimal totalIncome = sumByType(transactions, TransactionType.INCOME)
                .add(sumReceivables(receivables, linkedReceivableIds));
        BigDecimal totalExpenses = sumByType(transactions, TransactionType.EXPENSE)
                .add(sumPayables(payables, linkedPayableIds));

        Map<String, BigDecimal> expenseSummaryByCategory = new LinkedHashMap<>();
        transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory() != null)
                .forEach(transaction -> mergeAmount(expenseSummaryByCategory, transaction.getCategory().getName(), transaction.getAmount()));
        payables.stream()
                .filter(payable -> payable.getCategory() != null && !linkedPayableIds.contains(payable.getId()))
                .forEach(payable -> mergeAmount(expenseSummaryByCategory, payable.getCategory().getName(), payable.getAmount()));

        Map<String, BigDecimal> summaryByCostCenter = new LinkedHashMap<>();
        transactions.stream()
                .filter(transaction -> transaction.getCostCenter() != null)
                .forEach(transaction -> mergeAmount(summaryByCostCenter, transaction.getCostCenter().getName(), transaction.getAmount()));
        payables.stream()
                .filter(payable -> payable.getCostCenter() != null && !linkedPayableIds.contains(payable.getId()))
                .forEach(payable -> mergeAmount(summaryByCostCenter, payable.getCostCenter().getName(), payable.getAmount()));
        receivables.stream()
                .filter(receivable -> receivable.getCostCenter() != null && !linkedReceivableIds.contains(receivable.getId()))
                .forEach(receivable -> mergeAmount(summaryByCostCenter, receivable.getCostCenter().getName(), receivable.getAmount()));

        return Map.of(
                "monthlyCashFlow", totalIncome.subtract(totalExpenses),
                "totalIncome", totalIncome,
                "totalExpenses", totalExpenses,
                "balanceByBankAccount", byBank,
                "openPayables", payableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)),
                "openReceivables", receivableRepository.sumOpenAmount(companyId, List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)),
                "overdueBills", payableRepository.findByCompanyIdAndDueDateBeforeAndStatusIn(companyId, LocalDate.now(), List.of(DocumentStatus.OPEN, DocumentStatus.PARTIALLY_PAID, DocumentStatus.OVERDUE)).size(),
                "expenseSummaryByCategory", expenseSummaryByCategory,
                "summaryByCostCenter", summaryByCostCenter);
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

    private void mergeAmount(Map<String, BigDecimal> target, String key, BigDecimal amount) {
        target.merge(key, amount, BigDecimal::add);
    }
}
