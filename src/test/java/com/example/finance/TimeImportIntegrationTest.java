package com.example.finance;

import com.example.finance.employee.Employee;
import com.example.finance.employee.EmployeeRepository;
import com.example.finance.support.IntegrationTestBase;
import com.example.finance.timeschedule.EmployeeWorkSchedule;
import com.example.finance.timeschedule.EmployeeWorkScheduleRepository;
import com.example.finance.timeschedule.WorkSchedule;
import com.example.finance.timeschedule.WorkScheduleRepository;
import com.example.finance.user.Role;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TimeImportIntegrationTest extends IntegrationTestBase {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private WorkScheduleRepository workScheduleRepository;

    @Autowired
    private EmployeeWorkScheduleRepository employeeWorkScheduleRepository;

    @Test
    void shouldPreviewImportAndFlagInvalidRows() throws Exception {
        var ctx = createUserWithCompany("rh@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER));
        String token = token("rh@teste.com", "Senha@123");

        MockMultipartFile file = new MockMultipartFile("file", "ponto.csv", "text/csv", """
                cpf;data;hora;tipo;nome;matricula;departamento;observacao
                39053344705;21/05/2026;08:00;ENTRADA;Joao Silva;EMP001;Financeiro;
                00000000000;21/05/2026;12:00;INICIO_ALMOCO;Joao Silva;EMP001;Financeiro;
                """.getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/v1/companies/{companyId}/time/imports/preview", ctx.company().getId())
                        .file(file)
                        .param("createMissingEmployees", "true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(2))
                .andExpect(jsonPath("$.errorRows").value(1));
    }

    @Test
    void shouldConfirmImportIgnoreDuplicateAndGenerateMonthlyReport() throws Exception {
        var ctx = createUserWithCompany("rh2@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER, Role.HR_VIEWER));
        String token = token("rh2@teste.com", "Senha@123");

        Employee employee = new Employee();
        employee.setCompany(ctx.company());
        employee.setName("Joao Silva");
        employee.setCpf("39053344705");
        employee.setEmail("joao@teste.com");
        employee.setRegistrationNumber("EMP001");
        employee.setDepartment("Financeiro");
        employee.setPosition("Analista");
        employee.setActive(true);
        employee = employeeRepository.saveAndFlush(employee);

        WorkSchedule schedule = new WorkSchedule();
        schedule.setCompany(ctx.company());
        schedule.setName("Padrao");
        schedule.setExpectedDailyMinutes(480);
        schedule.setToleranceMinutes(10);
        schedule.setLunchBreakMinutes(60);
        schedule.setActive(true);
        schedule = workScheduleRepository.saveAndFlush(schedule);

        EmployeeWorkSchedule assignment = new EmployeeWorkSchedule();
        assignment.setCompany(ctx.company());
        assignment.setEmployee(employee);
        assignment.setWorkSchedule(schedule);
        assignment.setStartDate(LocalDate.of(2026, 5, 1));
        employeeWorkScheduleRepository.saveAndFlush(assignment);

        String csv = """
                cpf;data;hora;tipo;nome;matricula;departamento;observacao
                39053344705;21/05/2026;08:00;ENTRADA;Joao Silva;EMP001;Financeiro;
                39053344705;21/05/2026;12:00;INICIO_ALMOCO;Joao Silva;EMP001;Financeiro;
                39053344705;21/05/2026;13:00;FIM_ALMOCO;Joao Silva;EMP001;Financeiro;
                39053344705;21/05/2026;17:30;SAIDA;Joao Silva;EMP001;Financeiro;
                39053344705;21/05/2026;17:30;SAIDA;Joao Silva;EMP001;Financeiro;
                """;
        MockMultipartFile file = new MockMultipartFile("file", "ponto.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        String batchResponse = mockMvc.perform(multipart("/api/v1/companies/{companyId}/time/imports/confirm", ctx.company().getId())
                        .file(file)
                        .param("createMissingEmployees", "false")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.successRows").value(4))
                .andExpect(jsonPath("$.errorRows").value(1))
                .andReturn().getResponse().getContentAsString();

        UUID batchId = UUID.fromString(objectMapper.readTree(batchResponse).get("batchId").asText());

        mockMvc.perform(get("/api/v1/companies/{companyId}/time/imports/{batchId}/errors", ctx.company().getId(), batchId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].errorMessage").isNotEmpty());

        mockMvc.perform(get("/api/v1/companies/{companyId}/time/reports/monthly", ctx.company().getId())
                        .param("month", "2026-05")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalFuncionarios").value(1))
                .andExpect(jsonPath("$.totalHorasExtras").value(30));
    }
}
