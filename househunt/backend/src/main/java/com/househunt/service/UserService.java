package com.househunt.service;

import com.househunt.dto.AuthDtos;
import com.househunt.dto.UserDtos;
import com.househunt.entity.User;
import com.househunt.exception.ApiException;
import com.househunt.repository.UserRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    @Transactional
    public AuthDtos.PublicUser updateProfile(UserDtos.UpdateProfileRequest req) {
        User u = securityUtil.requireUser();
        u.setFullName(req.fullName().trim());
        u.setPhone(req.phone().trim());
        if (req.city() != null && !req.city().isBlank()) u.setCity(req.city().trim());
        if (req.avatarUrl() != null && !req.avatarUrl().isBlank()) u.setAvatarUrl(req.avatarUrl());
        u.setUpdatedAt(java.time.Instant.now());
        userRepository.save(u);
        return Mappers.user(u);
    }

    @Transactional
    public void changePassword(UserDtos.ChangePasswordRequest req) {
        User u = securityUtil.requireUser();
        if (!passwordEncoder.matches(req.currentPassword(), u.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect.");
        }
        u.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        u.setUpdatedAt(java.time.Instant.now());
        userRepository.save(u);
    }
}
