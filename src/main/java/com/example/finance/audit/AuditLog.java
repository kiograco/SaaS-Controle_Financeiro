package com.example.finance.audit;

import com.example.finance.common.entity.CompanyScopedEntity;
import com.example.finance.user.User;
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
@Table(name = "audit_logs")
@SQLRestriction("deleted_at is null")
public class AuditLog extends CompanyScopedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, length = 50)
    private String resource;

    @Column(nullable = false, length = 36)
    private String resourceId;

    @Column(nullable = false, length = 500)
    private String description;
}
