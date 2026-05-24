package com.example.finance.membership;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyMembershipRepository extends SoftDeleteRepository<CompanyMembership> {
    Optional<CompanyMembership> findByUserIdAndCompanyIdAndActiveTrue(UUID userId, UUID companyId);

    List<CompanyMembership> findAllByUserIdAndActiveTrue(UUID userId);

    List<CompanyMembership> findAllByCompanyIdAndActiveTrue(UUID companyId);
}
