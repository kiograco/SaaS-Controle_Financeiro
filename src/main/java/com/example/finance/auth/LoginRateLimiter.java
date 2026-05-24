package com.example.finance.auth;

import com.example.finance.exception.BusinessException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class LoginRateLimiter {

    private final Map<String, ArrayDeque<Instant>> attempts = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final long windowMinutes;

    public LoginRateLimiter(@Value("${app.login-rate-limit.max-attempts}") int maxAttempts,
                            @Value("${app.login-rate-limit.window-minutes}") long windowMinutes) {
        this.maxAttempts = maxAttempts;
        this.windowMinutes = windowMinutes;
    }

    public void check(String key) {
        ArrayDeque<Instant> deque = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        Instant limit = Instant.now().minusSeconds(windowMinutes * 60);
        while (!deque.isEmpty() && deque.peekFirst().isBefore(limit)) {
            deque.pollFirst();
        }
        if (deque.size() >= maxAttempts) {
            throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas de login. Tente novamente mais tarde.");
        }
    }

    public void registerFailure(String key) {
        attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>()).addLast(Instant.now());
    }

    public void clear(String key) {
        attempts.remove(key);
    }
}
