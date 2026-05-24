package com.example.finance.bankaccount.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BankAccountResponse(
        UUID id,
        String name,
        String bankName,
        String branchNumber,
        String accountNumber,
        BigDecimal balance,
        boolean active) {
}
