package com.example.finance.costcenter;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.costcenter.dto.CostCenterRequest;
import com.example.finance.costcenter.dto.CostCenterResponse;
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
@RequestMapping("/api/v1/companies/{companyId}/cost-centers")
@Tag(name = "Centros de Custo")
public class CostCenterController {

    private final CostCenterService service;

    @GetMapping
    public PageResponse<CostCenterResponse> list(@PathVariable UUID companyId,
                                                 @RequestParam(defaultValue = "") String search,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, search, page, size);
    }

    @GetMapping("/{id}")
    public CostCenterResponse get(@PathVariable UUID companyId, @PathVariable UUID id) {
        return service.get(companyId, id);
    }

    @PostMapping
    public CostCenterResponse create(@PathVariable UUID companyId, @Valid @RequestBody CostCenterRequest request) {
        return service.create(companyId, request);
    }

    @PutMapping("/{id}")
    public CostCenterResponse update(@PathVariable UUID companyId, @PathVariable UUID id, @Valid @RequestBody CostCenterRequest request) {
        return service.update(companyId, id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID companyId, @PathVariable UUID id) {
        service.delete(companyId, id);
    }
}
