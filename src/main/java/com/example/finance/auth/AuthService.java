package com.example.finance.auth;

import com.example.finance.auth.dto.AuthResponse;
import com.example.finance.auth.dto.LoginRequest;
import com.example.finance.auth.dto.RefreshTokenRequest;
import com.example.finance.auth.dto.RegisterRequest;
import com.example.finance.exception.BusinessException;
import com.example.finance.security.AppUserPrincipal;
import com.example.finance.security.JwtService;
import com.example.finance.user.Role;
import com.example.finance.user.User;
import com.example.finance.user.UserRepository;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginRateLimiter loginRateLimiter;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmailIgnoreCaseAndActiveTrue(request.email()).ifPresent(user -> {
            throw new BusinessException(HttpStatus.CONFLICT, "Ja existe um usuario com este e-mail.");
        });
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.getGlobalRoles().add(Role.FINANCE_VIEWER);
        user = userRepository.saveAndFlush(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String rateLimitKey) {
        loginRateLimiter.check(rateLimitKey);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));
            loginRateLimiter.clear(rateLimitKey);
        } catch (Exception ex) {
            loginRateLimiter.registerFailure(rateLimitKey);
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos.");
        }
        User user = userRepository.findByEmailIgnoreCaseAndActiveTrue(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos."));
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken stored = refreshTokenRepository.findByTokenAndRevokedFalse(request.refreshToken())
                .filter(token -> token.getExpiresAt().isAfter(OffsetDateTime.now()))
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Refresh token invalido ou expirado."));
        stored.setRevoked(true);
        return issueTokens(stored.getUser());
    }

    private AuthResponse issueTokens(User user) {
        AppUserPrincipal principal = new AppUserPrincipal(user);
        String accessToken = jwtService.generateToken(principal);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID() + "." + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(UUID.randomUUID().toString().getBytes()));
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(7));
        refreshTokenRepository.save(refreshToken);
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), accessToken, refreshToken.getToken());
    }
}
