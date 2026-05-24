package com.example.finance.employee;

import com.example.finance.common.entity.CompanyScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "employees")
@SQLRestriction("deleted_at is null")
public class Employee extends CompanyScopedEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Column(length = 120)
    private String email;

    @Column(length = 30)
    private String registrationNumber;

    @Column(length = 80)
    private String department;

    @Column(length = 80)
    private String position;

    @Column(nullable = false)
    private boolean active = true;
}
