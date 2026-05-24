package com.example.finance.timeschedule;

import com.example.finance.common.entity.CompanyScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "work_schedules")
@SQLRestriction("deleted_at is null")
public class WorkSchedule extends CompanyScopedEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private Integer expectedDailyMinutes;

    @Column(nullable = false)
    private Integer toleranceMinutes;

    @Column(nullable = false)
    private Integer lunchBreakMinutes;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private boolean active = true;
}
