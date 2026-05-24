package com.example.finance.bankaccount;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BankAccountRepository extends SoftDeleteRepository<BankAccount> {
    Page<BankAccount> findByCompanyIdAndNameContainingIgnoreCase(UUID companyId, String name, Pageable pageable);
    Optional<BankAccount> findByIdAndCompanyId(UUID id, UUID companyId);
}
