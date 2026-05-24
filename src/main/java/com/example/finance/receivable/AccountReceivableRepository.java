package com.example.finance.receivable;

import com.example.finance.common.entity.SoftDeleteRepository;
import com.example.finance.payable.DocumentStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountReceivableRepository extends SoftDeleteRepository<AccountReceivable> {
    Page<AccountReceivable> findByCompanyIdAndDescriptionContainingIgnoreCase(UUID companyId, String description, Pageable pageable);
    Optional<AccountReceivable> findByIdAndCompanyId(UUID id, UUID companyId);
    List<AccountReceivable> findByCompanyIdAndDueDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate);

    @Query("select coalesce(sum(a.amount - a.receivedAmount), 0) from AccountReceivable a where a.company.id = :companyId and a.status in :statuses")
    java.math.BigDecimal sumOpenAmount(@Param("companyId") UUID companyId, @Param("statuses") List<DocumentStatus> statuses);

    List<AccountReceivable> findByCompanyIdAndDueDateBeforeAndStatusIn(UUID companyId, LocalDate dueDate, List<DocumentStatus> statuses);
}
