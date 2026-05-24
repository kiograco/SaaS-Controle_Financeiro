package com.example.finance.timeimport;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.timeimport.dto.TimeImportBatchResponse;
import com.example.finance.timeimport.dto.TimeImportConfirmResponse;
import com.example.finance.timeimport.dto.TimeImportErrorResponse;
import com.example.finance.timeimport.dto.TimeImportPreviewResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies/{companyId}/time/imports")
@Tag(name = "Importacao de Ponto")
public class TimeImportController {

    private final TimeImportService service;

    @PostMapping("/preview")
    public TimeImportPreviewResponse preview(@PathVariable UUID companyId,
                                             @RequestPart MultipartFile file,
                                             @RequestParam(defaultValue = "false") boolean createMissingEmployees) {
        return service.preview(companyId, file, createMissingEmployees);
    }

    @PostMapping("/confirm")
    public TimeImportConfirmResponse confirm(@PathVariable UUID companyId,
                                             @RequestPart MultipartFile file,
                                             @RequestParam(defaultValue = "false") boolean createMissingEmployees) {
        return service.confirm(companyId, file, createMissingEmployees);
    }

    @GetMapping
    public PageResponse<TimeImportBatchResponse> list(@PathVariable UUID companyId,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, page, size);
    }

    @GetMapping("/{batchId}/errors")
    public List<TimeImportErrorResponse> errors(@PathVariable UUID companyId, @PathVariable UUID batchId) {
        return service.errors(companyId, batchId);
    }

    @DeleteMapping("/{batchId}")
    public void delete(@PathVariable UUID companyId, @PathVariable UUID batchId) {
        service.delete(companyId, batchId);
    }
}
