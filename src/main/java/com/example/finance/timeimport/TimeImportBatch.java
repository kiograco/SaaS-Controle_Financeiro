package com.example.finance.timeimport;

import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "time_import_batches")
@SQLRestriction("deleted_at is null")
public class TimeImportBatch extends CompanyScopedEntity {

    @Column(nullable = false, length = 160)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TimeImportBatchStatus status;

    @Column(nullable = false)
    private Integer totalRows = 0;

    @Column(nullable = false)
    private Integer successRows = 0;

    @Column(nullable = false)
    private Integer errorRows = 0;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "imported_by_user_id", nullable = false)
    private User importedByUser;

    private OffsetDateTime finishedAt;
}
