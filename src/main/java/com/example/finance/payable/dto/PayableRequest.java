package com.example.finance.payable.dto;

import com.example.finance.payable.DocumentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PayableRequest(
        UUID categoryId,
        UUID costCenterId,
        UUID bankAccountId,
        @NotBlank(message = "Informe a descricao da conta a pagar.") String description,
        @NotBlank(message = "Informe o fornecedor.") String supplierName,
        @NotNull(message = "Informe a data de vencimento.") LocalDate dueDate,
        @NotNull(message = "Informe o valor.") @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.") BigDecimal amount,
        @NotNull(message = "Informe o valor pago.") @DecimalMin(value = "0.00", message = "O valor pago nao pode ser negativo.") BigDecimal paidAmount,
        @NotNull(message = "Informe o status.") DocumentStatus status,
        String notes) {
}
