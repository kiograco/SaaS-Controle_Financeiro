package com.example.finance.costcenter;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CostCenterRepository extends SoftDeleteRepository<CostCenter> {
    Page<CostCenter> findByCompanyIdAndNameContainingIgnoreCase(UUID companyId, String name, Pageable pageable);
    Optional<CostCenter> findByIdAndCompanyId(UUID id, UUID companyId);
}
