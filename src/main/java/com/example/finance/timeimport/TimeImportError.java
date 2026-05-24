package com.example.finance.timeimport;

import com.example.finance.common.entity.CompanyScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "time_import_errors")
@SQLRestriction("deleted_at is null")
public class TimeImportError extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private TimeImportBatch batch;

    @Column(nullable = false)
    private Integer rowNumber;

    @Column(nullable = false, length = 500)
    private String rawContent;

    @Column(nullable = false, length = 255)
    private String errorMessage;
}
