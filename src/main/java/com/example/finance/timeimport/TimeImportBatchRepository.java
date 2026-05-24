package com.example.finance.timeimport;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TimeImportBatchRepository extends SoftDeleteRepository<TimeImportBatch> {
    Page<TimeImportBatch> findByCompanyId(UUID companyId, Pageable pageable);
    Optional<TimeImportBatch> findByIdAndCompanyId(UUID id, UUID companyId);
}
