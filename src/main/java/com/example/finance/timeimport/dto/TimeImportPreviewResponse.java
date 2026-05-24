package com.example.finance.timeimport.dto;

import java.util.List;

public record TimeImportPreviewResponse(
        int totalRows,
        int validRows,
        int errorRows,
        List<TimeImportPreviewRow> rows) {
}
