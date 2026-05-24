package com.example.finance.timereport;

import com.example.finance.timereport.dto.MonthlyTimeReportResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.YearMonth;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies/{companyId}/time/reports")
@Tag(name = "Relatorios de Ponto")
public class TimeReportController {

    private final TimeReportService service;

    @GetMapping("/monthly")
    public MonthlyTimeReportResponse monthly(@PathVariable UUID companyId,
                                             @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return service.monthly(companyId, month);
    }
}
