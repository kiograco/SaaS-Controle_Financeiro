package com.example.finance.dashboard;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.YearMonth;
import java.util.Map;
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
@RequestMapping("/api/v1/companies/{companyId}/dashboard")
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService service;

    @GetMapping
    public Map<String, Object> dashboard(@PathVariable UUID companyId,
                                         @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return service.dashboard(companyId, month);
    }
}
