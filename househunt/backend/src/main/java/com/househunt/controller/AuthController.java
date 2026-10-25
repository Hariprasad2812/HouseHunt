package com.househunt.controller;

import com.househunt.dto.AuthDtos;
import com.househunt.dto.UserDtos;
import com.househunt.entity.User;
import com.househunt.exception.ApiException;
import com.househunt.security.SecurityUtil;
import com.househunt.service.AuthService;
import com.househunt.service.NotificationService;
import com.househunt.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final SecurityUtil securityUtil;
    private final NotificationService notificationService;

    @PostMapping("/register")
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public AuthDtos.AuthResponse me() {
        return authService.me();
    }

    @PutMapping("/me")
    public AuthDtos.PublicUser updateProfile(@Valid @RequestBody UserDtos.UpdateProfileRequest req) {
        return userService.updateProfile(req);
    }

    @PutMapping("/me/password")
    public Map<String, String> changePassword(@Valid @RequestBody UserDtos.ChangePasswordRequest req) {
        userService.changePassword(req);
        return Map.of("message", "Password updated successfully.");
    }

    @GetMapping("/notifications/unread")
    public Map<String, Long> unread() {
        User u = securityUtil.requireUser();
        return Map.of("count", notificationService.unreadCount(u));
    }
}
