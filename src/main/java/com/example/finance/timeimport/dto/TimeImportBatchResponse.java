package com.example.finance.timeimport.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TimeImportBatchResponse(
        UUID id,
        String fileName,
        String status,
        int totalRows,
        int successRows,
        int errorRows,
        OffsetDateTime createdAt,
        OffsetDateTime finishedAt) {
}
