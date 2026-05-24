package com.example.finance.auth;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends SoftDeleteRepository<RefreshToken> {
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);
}
