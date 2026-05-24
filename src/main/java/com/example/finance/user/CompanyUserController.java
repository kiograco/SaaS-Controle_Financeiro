package com.example.finance.user;

import com.example.finance.user.dto.CompanyUserResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/companies/{companyId}/users")
@Tag(name = "Usuarios")
public class CompanyUserController {

    private final CompanyUserService companyUserService;

    @GetMapping
    public List<CompanyUserResponse> list(@PathVariable UUID companyId) {
        return companyUserService.list(companyId);
    }
}
