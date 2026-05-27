package com.example.finance;

import com.example.finance.support.IntegrationTestBase;
import com.example.finance.user.Role;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WorkScheduleIntegrationTest extends IntegrationTestBase {

    @Test
    void shouldDefaultWorkingDaysWhenLegacyClientOmitsField() throws Exception {
        var ctx = createUserWithCompany("rh@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER));
        String token = token("rh@teste.com", "Senha@123");

        mockMvc.perform(post("/api/v1/companies/{companyId}/work-schedules", ctx.company().getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Administrativo",
                                  "expectedDailyMinutes": 480,
                                  "toleranceMinutes": 10,
                                  "lunchBreakMinutes": 60,
                                  "startTime": "08:00",
                                  "endTime": "18:00",
                                  "active": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workingDays[0]").value("MONDAY"))
                .andExpect(jsonPath("$.workingDays[4]").value("FRIDAY"));
    }

    @Test
    void shouldRejectExplicitlyEmptyWorkingDays() throws Exception {
        var ctx = createUserWithCompany("rh@teste.com", "Senha@123", Set.of(Role.COMPANY_ADMIN, Role.HR_MANAGER));
        String token = token("rh@teste.com", "Senha@123");

        mockMvc.perform(post("/api/v1/companies/{companyId}/work-schedules", ctx.company().getId())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sem dias",
                                  "workingDays": [],
                                  "expectedDailyMinutes": 480,
                                  "toleranceMinutes": 10,
                                  "lunchBreakMinutes": 60,
                                  "startTime": "08:00",
                                  "endTime": "18:00",
                                  "active": true
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.workingDays").value("Informe os dias da semana da jornada."));
    }
}
