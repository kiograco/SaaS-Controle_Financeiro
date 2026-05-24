package com.example.finance.category;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryRepository extends SoftDeleteRepository<Category> {
    Page<Category> findByCompanyIdAndNameContainingIgnoreCase(UUID companyId, String name, Pageable pageable);
    Optional<Category> findByIdAndCompanyId(UUID id, UUID companyId);
}
