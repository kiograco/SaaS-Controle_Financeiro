package com.example.finance.timeimport.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeImportPreviewRow(
        int rowNumber,
        String cpf,
        String nome,
        String departamento,
        LocalDate data,
        LocalTime hora,
        String tipo,
        boolean valido,
        String mensagem) {
}
