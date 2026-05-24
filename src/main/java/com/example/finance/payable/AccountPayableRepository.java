package com.example.finance.payable;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountPayableRepository extends SoftDeleteRepository<AccountPayable> {
    Page<AccountPayable> findByCompanyIdAndDescriptionContainingIgnoreCase(UUID companyId, String description, Pageable pageable);
    Optional<AccountPayable> findByIdAndCompanyId(UUID id, UUID companyId);
    List<AccountPayable> findByCompanyIdAndDueDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate);
    long countByCompanyIdAndStatus(UUID companyId, DocumentStatus status);

    @Query("select coalesce(sum(a.amount - a.paidAmount), 0) from AccountPayable a where a.company.id = :companyId and a.status in :statuses")
    java.math.BigDecimal sumOpenAmount(@Param("companyId") UUID companyId, @Param("statuses") List<DocumentStatus> statuses);

    List<AccountPayable> findByCompanyIdAndDueDateBeforeAndStatusIn(UUID companyId, LocalDate dueDate, List<DocumentStatus> statuses);
}
