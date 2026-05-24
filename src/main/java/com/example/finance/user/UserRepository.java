package com.example.finance.user;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;

public interface UserRepository extends SoftDeleteRepository<User> {
    Optional<User> findByEmailIgnoreCaseAndActiveTrue(String email);
}
