package com.example.finance.transaction.dto;

import com.example.finance.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID categoryId,
        UUID costCenterId,
        UUID bankAccountId,
        UUID payableId,
        UUID receivableId,
        String description,
        LocalDate transactionDate,
        TransactionType type,
        BigDecimal amount,
        String notes) {
}
