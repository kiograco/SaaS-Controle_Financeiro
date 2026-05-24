package com.example.finance.common.entity;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface SoftDeleteRepository<T extends BaseEntity> extends JpaRepository<T, UUID> {
}
