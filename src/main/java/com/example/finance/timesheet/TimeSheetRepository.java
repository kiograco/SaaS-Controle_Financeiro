package com.example.finance.timesheet;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TimeSheetRepository extends SoftDeleteRepository<TimeSheet> {
    Page<TimeSheet> findByCompanyIdAndReferenceDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Optional<TimeSheet> findByCompanyIdAndEmployeeIdAndReferenceDate(UUID companyId, UUID employeeId, LocalDate referenceDate);
    List<TimeSheet> findByCompanyIdAndReferenceDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate);
}
