package com.example.finance.auth;

import com.example.finance.auth.dto.AuthResponse;
import com.example.finance.auth.dto.LoginRequest;
import com.example.finance.auth.dto.RefreshTokenRequest;
import com.example.finance.auth.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticacao")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar usuario")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Realizar login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        return authService.login(request, httpServletRequest.getRemoteAddr());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar token")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }
}
