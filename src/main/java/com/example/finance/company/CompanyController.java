package com.example.finance.company;

import com.example.finance.company.dto.CompanyCreateRequest;
import com.example.finance.company.dto.CompanyResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies")
@Tag(name = "Empresas")
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public CompanyResponse create(@Valid @RequestBody CompanyCreateRequest request) {
        return companyService.create(request);
    }
}
