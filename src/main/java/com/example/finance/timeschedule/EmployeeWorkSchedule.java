package com.example.finance.timeschedule;

import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.employee.Employee;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "employee_work_schedules")
@SQLRestriction("deleted_at is null")
public class EmployeeWorkSchedule extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_schedule_id", nullable = false)
    private WorkSchedule workSchedule;

    @jakarta.persistence.Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;
}
