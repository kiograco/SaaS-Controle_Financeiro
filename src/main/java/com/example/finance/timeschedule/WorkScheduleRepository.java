package com.example.finance.timeschedule;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkScheduleRepository extends SoftDeleteRepository<WorkSchedule> {
    Page<WorkSchedule> findByCompanyIdAndNameContainingIgnoreCase(UUID companyId, String name, Pageable pageable);
    Optional<WorkSchedule> findByIdAndCompanyId(UUID id, UUID companyId);
}
