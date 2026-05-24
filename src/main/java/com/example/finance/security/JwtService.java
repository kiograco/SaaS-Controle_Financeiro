package com.example.finance.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMinutes;

    public JwtService(@Value("${app.security.jwt-secret}") String secret,
                      @Value("${app.security.jwt-expiration-minutes}") long expirationMinutes) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(AppUserPrincipal principal) {
        var now = OffsetDateTime.now(ZoneOffset.UTC);
        return Jwts.builder()
                .subject(principal.getUsername())
                .claims(Map.of("uid", principal.getId().toString()))
                .issuedAt(Date.from(now.toInstant()))
                .expiration(Date.from(now.plusMinutes(expirationMinutes).toInstant()))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token, AppUserPrincipal principal) {
        Claims claims = parse(token);
        return principal.getUsername().equalsIgnoreCase(claims.getSubject())
                && claims.getExpiration().after(new Date());
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
