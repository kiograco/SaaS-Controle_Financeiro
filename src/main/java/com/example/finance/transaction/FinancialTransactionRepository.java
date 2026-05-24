package com.example.finance.transaction;

import com.example.finance.common.entity.SoftDeleteRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FinancialTransactionRepository extends SoftDeleteRepository<FinancialTransaction> {
    Page<FinancialTransaction> findByCompanyIdAndDescriptionContainingIgnoreCase(UUID companyId, String description, Pageable pageable);
    Optional<FinancialTransaction> findByIdAndCompanyId(UUID id, UUID companyId);
    List<FinancialTransaction> findByCompanyIdAndTransactionDateBetween(UUID companyId, LocalDate startDate, LocalDate endDate);

    @Query("select distinct t.payable.id from FinancialTransaction t where t.company.id = :companyId and t.payable is not null")
    Set<UUID> findLinkedPayableIdsByCompanyId(@Param("companyId") UUID companyId);

    @Query("select distinct t.receivable.id from FinancialTransaction t where t.company.id = :companyId and t.receivable is not null")
    Set<UUID> findLinkedReceivableIdsByCompanyId(@Param("companyId") UUID companyId);

    @Query("select coalesce(sum(t.amount), 0) from FinancialTransaction t where t.company.id = :companyId and t.type = :type")
    java.math.BigDecimal sumByType(@Param("companyId") UUID companyId, @Param("type") TransactionType type);
}
