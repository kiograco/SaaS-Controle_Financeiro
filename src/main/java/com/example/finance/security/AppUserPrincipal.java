package com.example.finance.security;

import com.example.finance.user.Role;
import com.example.finance.user.User;
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AppUserPrincipal implements UserDetails {

    private final User user;

    public AppUserPrincipal(User user) {
        this.user = user;
    }

    public java.util.UUID getId() {
        return user.getId();
    }

    public Set<Role> getGlobalRoles() {
        return user.getGlobalRoles();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getGlobalRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return user.isActive();
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isActive();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return user.isActive();
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
}
