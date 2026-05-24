package com.example.finance.bankaccount;

import com.example.finance.common.entity.CompanyScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "bank_accounts")
@SQLRestriction("deleted_at is null")
public class BankAccount extends CompanyScopedEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String bankName;

    @Column(length = 20)
    private String branchNumber;

    @Column(nullable = false, length = 30)
    private String accountNumber;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;
}
