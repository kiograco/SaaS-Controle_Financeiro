package com.example.finance;

import com.example.finance.category.dto.CategoryRequest;
import com.example.finance.category.CategoryType;
import com.example.finance.support.IntegrationTestBase;
import com.example.finance.user.Role;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Set;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TenantIsolationIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldBlockAccessFromAnotherCompany() throws Exception {
        var ctxA = createUserWithCompany("a@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER));
        var ctxB = createUserWithCompany("b@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER));
        String tokenA = token("a@teste.com", "Senha@123");

        mockMvc.perform(post("/api/v1/companies/{companyId}/categories", ctxB.company().getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryRequest("Operacional", "Despesa operacional", CategoryType.EXPENSE, true))))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldCreateAndReadCategoryInsideTenant() throws Exception {
        var ctx = createUserWithCompany("financeiro@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.FINANCE_MANAGER));
        String token = token("financeiro@teste.com", "Senha@123");

        String response = mockMvc.perform(post("/api/v1/companies/{companyId}/categories", ctx.company().getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CategoryRequest("Receitas", "Receitas gerais", CategoryType.INCOME, true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Receitas"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        UUID categoryId = UUID.fromString(objectMapper.readTree(response).get("id").asText());

        mockMvc.perform(get("/api/v1/companies/{companyId}/categories/{id}", ctx.company().getId(), categoryId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoryId.toString()));
    }
}
