package com.example.finance.receivable;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.receivable.dto.ReceivableRequest;
import com.example.finance.receivable.dto.ReceivableResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies/{companyId}/receivables")
@Tag(name = "Contas a Receber")
public class ReceivableController {

    private final ReceivableService service;

    @GetMapping
    public PageResponse<ReceivableResponse> list(@PathVariable UUID companyId,
                                                 @RequestParam(defaultValue = "") String search,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, search, page, size);
    }

    @GetMapping("/{id}")
    public ReceivableResponse get(@PathVariable UUID companyId, @PathVariable UUID id) {
        return service.get(companyId, id);
    }

    @PostMapping
    public ReceivableResponse create(@PathVariable UUID companyId, @Valid @RequestBody ReceivableRequest request) {
        return service.create(companyId, request);
    }

    @PutMapping("/{id}")
    public ReceivableResponse update(@PathVariable UUID companyId, @PathVariable UUID id, @Valid @RequestBody ReceivableRequest request) {
        return service.update(companyId, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID companyId, @PathVariable UUID id) {
        service.delete(companyId, id);
    }
}
