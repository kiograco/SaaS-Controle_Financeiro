package com.example.finance.payable.dto;

import com.example.finance.payable.DocumentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PayableResponse(
        UUID id,
        UUID categoryId,
        UUID costCenterId,
        UUID bankAccountId,
        String description,
        String supplierName,
        LocalDate dueDate,
        BigDecimal amount,
        BigDecimal paidAmount,
        DocumentStatus status,
        String notes) {
}
