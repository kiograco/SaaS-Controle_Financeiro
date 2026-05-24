package com.example.finance.timeentry;

import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.employee.Employee;
import com.example.finance.timeimport.TimeImportBatch;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "time_entries")
@SQLRestriction("deleted_at is null")
public class TimeEntry extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(nullable = false)
    private LocalTime entryTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TimeEntryType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TimeEntrySource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id")
    private TimeImportBatch importBatch;

    @Column(length = 255)
    private String notes;
}
