package com.example.finance.costcenter;

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
@Table(name = "cost_centers")
@SQLRestriction("deleted_at is null")
public class CostCenter extends CompanyScopedEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false)
    private boolean active = true;
}
