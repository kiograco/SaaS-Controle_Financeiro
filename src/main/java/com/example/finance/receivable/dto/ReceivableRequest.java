package com.example.finance.receivable.dto;

import com.example.finance.payable.DocumentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReceivableRequest(
        UUID categoryId,
        UUID costCenterId,
        UUID bankAccountId,
        @NotBlank(message = "Informe a descricao da conta a receber.") String description,
        @NotBlank(message = "Informe o cliente.") String customerName,
        @NotNull(message = "Informe a data de vencimento.") LocalDate dueDate,
        @NotNull(message = "Informe o valor.") @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.") BigDecimal amount,
        @NotNull(message = "Informe o valor recebido.") @DecimalMin(value = "0.00", message = "O valor recebido nao pode ser negativo.") BigDecimal receivedAmount,
        @NotNull(message = "Informe o status.") DocumentStatus status,
        String notes) {
}
