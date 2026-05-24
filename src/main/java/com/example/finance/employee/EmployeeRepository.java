package com.example.finance.employee;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeRepository extends SoftDeleteRepository<Employee> {
    Page<Employee> findByCompanyIdAndNameContainingIgnoreCase(UUID companyId, String name, Pageable pageable);
    Optional<Employee> findByIdAndCompanyId(UUID id, UUID companyId);
    Optional<Employee> findByCompanyIdAndCpf(UUID companyId, String cpf);
}
