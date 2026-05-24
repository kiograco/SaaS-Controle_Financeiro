package com.example.finance.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI openAPI() {
        return new OpenAPI().info(new Info()
                .title("SaaS de Gestao Financeira e Ponto")
                .description("API multiempresa com isolamento por companhia, gestao financeira e gestao de ponto.")
                .version("v1")
                .contact(new Contact().name("Equipe Finance")));
    }
}
