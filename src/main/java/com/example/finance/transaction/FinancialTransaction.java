package com.example.finance.transaction;

import com.example.finance.bankaccount.BankAccount;
import com.example.finance.category.Category;
import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.costcenter.CostCenter;
import com.example.finance.payable.AccountPayable;
import com.example.finance.receivable.AccountReceivable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "financial_transactions")
@SQLRestriction("deleted_at is null")
public class FinancialTransaction extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_center_id")
    private CostCenter costCenter;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payable_id")
    private AccountPayable payable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receivable_id")
    private AccountReceivable receivable;

    @Column(nullable = false, length = 160)
    private String description;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String notes;
}
