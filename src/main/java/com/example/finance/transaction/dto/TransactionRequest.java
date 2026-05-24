package com.example.finance.transaction.dto;

import com.example.finance.transaction.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(
        UUID categoryId,
        UUID costCenterId,
        @NotNull(message = "Informe a conta bancaria.") UUID bankAccountId,
        UUID payableId,
        UUID receivableId,
        @NotBlank(message = "Informe a descricao do lancamento.") String description,
        @NotNull(message = "Informe a data do lancamento.") LocalDate transactionDate,
        @NotNull(message = "Informe o tipo do lancamento.") TransactionType type,
        @NotNull(message = "Informe o valor.") @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.") BigDecimal amount,
        String notes) {
}
