package com.example.finance.user;

import com.example.finance.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "users")
@SQLRestriction("deleted_at is null")
public class User extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @jakarta.persistence.ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "user_global_roles")
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Set<Role> globalRoles = new HashSet<>();

    @Column(nullable = false)
    private boolean active = true;
}
