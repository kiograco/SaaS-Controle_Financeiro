package com.example.finance.timeentry;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TimeEntryRepository extends SoftDeleteRepository<TimeEntry> {
    Page<TimeEntry> findByCompanyIdAndEmployeeIdAndEntryDateBetween(UUID companyId, UUID employeeId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<TimeEntry> findByCompanyIdAndEntryDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    Optional<TimeEntry> findByCompanyIdAndEmployeeIdAndEntryDateAndEntryTimeAndType(UUID companyId, UUID employeeId, LocalDate date, LocalTime time, TimeEntryType type);
    List<TimeEntry> findByCompanyIdAndEmployeeIdAndEntryDate(UUID companyId, UUID employeeId, LocalDate entryDate);
    List<TimeEntry> findByCompanyIdAndImportBatchId(UUID companyId, UUID importBatchId);
}
