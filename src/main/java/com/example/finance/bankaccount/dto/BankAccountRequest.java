package com.example.finance.bankaccount.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BankAccountRequest(
        @NotBlank(message = "Informe o nome da conta bancaria.") String name,
        @NotBlank(message = "Informe o nome do banco.") String bankName,
        String branchNumber,
        @NotBlank(message = "Informe o numero da conta.") String accountNumber,
        @NotNull(message = "Informe o saldo.") @DecimalMin(value = "0.00", message = "O saldo nao pode ser negativo.") BigDecimal balance,
        boolean active) {
}
