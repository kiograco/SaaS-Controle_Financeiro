package com.example.finance.timeschedule;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeWorkScheduleRepository extends SoftDeleteRepository<EmployeeWorkSchedule> {
    Optional<EmployeeWorkSchedule> findFirstByCompanyIdAndEmployeeIdAndStartDateLessThanEqualAndEndDateIsNullOrderByStartDateDesc(
            UUID companyId, UUID employeeId, LocalDate date);
}
