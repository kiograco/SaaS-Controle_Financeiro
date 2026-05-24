package com.example.finance.security;

import com.example.finance.exception.BusinessException;
import com.example.finance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userRepository.findByEmailIgnoreCaseAndActiveTrue(username)
                .map(AppUserPrincipal::new)
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos."));
    }
}
