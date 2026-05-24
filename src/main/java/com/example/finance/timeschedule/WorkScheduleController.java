package com.example.finance.timeschedule;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.timeschedule.dto.EmployeeWorkScheduleRequest;
import com.example.finance.timeschedule.dto.WorkScheduleRequest;
import com.example.finance.timeschedule.dto.WorkScheduleResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api/v1/companies/{companyId}/work-schedules")
@Tag(name = "Jornadas")
public class WorkScheduleController {

    private final WorkScheduleService service;

    @GetMapping
    public PageResponse<WorkScheduleResponse> list(@PathVariable UUID companyId,
                                                   @RequestParam(defaultValue = "") String search,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, search, page, size);
    }

    @PostMapping
    public WorkScheduleResponse create(@PathVariable UUID companyId, @Valid @RequestBody WorkScheduleRequest request) {
        return service.create(companyId, request);
    }

    @PutMapping("/{id}")
    public WorkScheduleResponse update(@PathVariable UUID companyId, @PathVariable UUID id, @Valid @RequestBody WorkScheduleRequest request) {
        return service.update(companyId, id, request);
    }

    @PostMapping("/assignments")
    public void assign(@PathVariable UUID companyId, @Valid @RequestBody EmployeeWorkScheduleRequest request) {
        service.assign(companyId, request);
    }
}
