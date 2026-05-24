package com.example.finance.timesheet;

import com.example.finance.common.dto.PageResponse;
import com.example.finance.timesheet.dto.RecalculateTimeSheetRequest;
import com.example.finance.timesheet.dto.TimeSheetResponse;
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
@RequestMapping("/api/v1/companies/{companyId}/time/sheets")
@Tag(name = "Espelho de Ponto")
public class TimeSheetController {

    private final TimeSheetService service;

    @GetMapping
    public PageResponse<TimeSheetResponse> list(@PathVariable UUID companyId,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return service.list(companyId, startDate, endDate, page, size);
    }

    @PostMapping("/recalculate")
    public void recalculate(@PathVariable UUID companyId, @Valid @RequestBody RecalculateTimeSheetRequest request) {
        service.recalculate(companyId, request);
    }
}
