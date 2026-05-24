package com.example.finance.support;

import com.example.finance.company.Company;
import com.example.finance.company.CompanyRepository;
import com.example.finance.membership.CompanyMembership;
import com.example.finance.membership.CompanyMembershipRepository;
import com.example.finance.user.Role;
import com.example.finance.user.User;
import com.example.finance.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class IntegrationTestBase {

    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        postgres.start();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected CompanyRepository companyRepository;

    @Autowired
    protected CompanyMembershipRepository membershipRepository;

    @Autowired
    protected JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanup() {
        jdbcTemplate.execute("""
                truncate table
                company_membership_roles,
                company_memberships,
                user_global_roles,
                refresh_tokens,
                audit_logs,
                time_import_errors,
                time_import_batches,
                time_sheets,
                time_entries,
                employee_work_schedules,
                work_schedules,
                employees,
                financial_transactions,
                accounts_receivable,
                accounts_payable,
                bank_accounts,
                cost_centers,
                categories,
                users,
                companies
                restart identity cascade
                """);
    }

    protected TestContext createUserWithCompany(String email, String password, Set<Role> roles) {
        Company company = new Company();
        company.setLegalName("Empresa " + UUID.randomUUID());
        company.setTradeName("Empresa Teste");
        company.setCnpj(UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        company = companyRepository.saveAndFlush(company);

        User user = new User();
        user.setName("Usuario Teste");
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userRepository.saveAndFlush(user);

        CompanyMembership membership = new CompanyMembership();
        membership.setCompany(company);
        membership.setUser(user);
        membership.setRoles(roles);
        membershipRepository.saveAndFlush(membership);

        return new TestContext(company, user);
    }

    protected String token(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("accessToken").asText();
    }

    protected record TestContext(Company company, User user) {
    }
}
