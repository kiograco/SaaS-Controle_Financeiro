package com.example.finance.timeimport;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.List;
import java.util.UUID;

public interface TimeImportErrorRepository extends SoftDeleteRepository<TimeImportError> {
    List<TimeImportError> findByCompanyIdAndBatchId(UUID companyId, UUID batchId);
}
