package com.example.finance.timesheet;

import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.employee.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "time_sheets")
@SQLRestriction("deleted_at is null")
public class TimeSheet extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate referenceDate;

    @Column(nullable = false)
    private Integer workedMinutes;

    @Column(nullable = false)
    private Integer overtimeMinutes;

    @Column(nullable = false)
    private Integer missingMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TimeSheetStatus status;

    @Column(nullable = false)
    private OffsetDateTime calculatedAt;
}
