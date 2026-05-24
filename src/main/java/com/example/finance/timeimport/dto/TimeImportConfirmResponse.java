package com.example.finance.timeimport.dto;

import java.util.UUID;

public record TimeImportConfirmResponse(
        UUID batchId,
        int totalRows,
        int successRows,
        int errorRows,
        String status) {
}
