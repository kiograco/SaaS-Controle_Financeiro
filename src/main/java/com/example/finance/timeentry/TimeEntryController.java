package com.example.finance.timeentry;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.timeentry.dto.TimeEntryRequest;
import com.example.finance.timeentry.dto.TimeEntryResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies/{companyId}/time/entries")
@Tag(name = "Gestao de Ponto")
public class TimeEntryController {

    private final TimeEntryService service;

    @GetMapping
    public PageResponse<TimeEntryResponse> list(@PathVariable UUID companyId,
                                                @RequestParam(required = false) UUID employeeId,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, employeeId, startDate, endDate, page, size);
    }

    @PostMapping
    public TimeEntryResponse create(@PathVariable UUID companyId, @Valid @RequestBody TimeEntryRequest request) {
        return service.create(companyId, request);
    }
}
