package com.example.finance.company;

import com.example.finance.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "companies")
@SQLRestriction("deleted_at is null")
public class Company extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String legalName;

    @Column(nullable = false, length = 100)
    private String tradeName;

    @Column(nullable = false, length = 18, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private boolean active = true;
}
