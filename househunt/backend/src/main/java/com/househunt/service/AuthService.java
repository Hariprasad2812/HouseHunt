package com.househunt.service;

import com.househunt.dto.AuthDtos;
import com.househunt.entity.Role;
import com.househunt.entity.User;
import com.househunt.exception.ApiException;
import com.househunt.repository.UserRepository;
import com.househunt.security.JwtService;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account with this email already exists. Try signing in.");
        }
        User u = new User();
        u.setFullName(req.fullName().trim());
        u.setEmail(email);
        u.setPhone(req.phone().trim());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setAccountType(req.accountType() == null ? User.AccountType.TENANT : req.accountType());
        u.setRole(u.getAccountType() == User.AccountType.OWNER ? Role.OWNER : Role.TENANT);
        u.setVerified(true);
        u.setAvatarUrl("https://api.dicebear.com/7.x/initials/svg?seed=" + urlSafe(u.getFullName()));
        userRepository.save(u);
        notificationService.notify(u, NotificationService.safeType("SYSTEM"),
                "Welcome to HouseHunt", "Your " + u.getRole().name().toLowerCase() + " account is ready. Start exploring homes in Bengaluru.", null);
        return tokenResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User u = userRepository.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("No account found for this email."));
        if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            throw ApiException.unauthorized("Incorrect password. Please try again.");
        }
        if (!u.isActive()) {
            throw ApiException.forbidden("This account has been suspended. Contact support.");
        }
        return tokenResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthResponse me() {
        User u = securityUtil.requireUser();
        return tokenResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthDtos.PublicUser profile() {
        return Mappers.user(securityUtil.requireUser());
    }

    private AuthDtos.AuthResponse tokenResponse(User u) {
        String token = jwtService.generate(u.getId(), u.getEmail(), u.getRole());
        return new AuthDtos.AuthResponse(token, "Bearer", 604_800_000L, Mappers.user(u));
    }

    private static String urlSafe(String s) {
        return s.replaceAll("[^a-zA-Z0-9]", "");
    }
}
