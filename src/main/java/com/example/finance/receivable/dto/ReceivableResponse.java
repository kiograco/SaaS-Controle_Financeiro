package com.example.finance.receivable.dto;

import com.example.finance.payable.DocumentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReceivableResponse(
        UUID id,
        UUID categoryId,
        UUID costCenterId,
        UUID bankAccountId,
        String description,
        String customerName,
        LocalDate dueDate,
        BigDecimal amount,
        BigDecimal receivedAmount,
        DocumentStatus status,
        String notes) {
}
