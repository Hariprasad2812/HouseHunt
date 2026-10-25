package com.househunt.security;

import com.househunt.entity.User;
import com.househunt.exception.ApiException;
import com.househunt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtPrincipal jp)) return null;
        return userRepository.findById(jp.userId()).orElse(null);
    }

    public User requireUser() {
        User u = currentUserOrNull();
        if (u == null) throw ApiException.unauthorized("Please sign in to continue.");
        return u;
    }
}
