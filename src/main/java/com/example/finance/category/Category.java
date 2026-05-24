package com.example.finance.category;

import com.example.finance.common.entity.CompanyScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "categories")
@SQLRestriction("deleted_at is null")
public class Category extends CompanyScopedEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoryType type;

    @Column(nullable = false)
    private boolean active = true;
}
