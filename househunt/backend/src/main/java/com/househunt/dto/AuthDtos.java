package com.househunt.dto;

import com.househunt.entity.Role;
import com.househunt.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Pattern(regexp = "^[0-9+\\- ]{7,15}$", message = "Enter a valid phone number") String phone,
            @NotBlank @Size(min = 8, max = 72, message = "Password must be 8–72 characters") String password,
            User.AccountType accountType
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record PublicUser(
            Long id, String fullName, String email, String phone,
            Role role, User.AccountType accountType,
            boolean verified, String avatarUrl, String city, Instant createdAt
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            long expiresInMs,
            PublicUser user
    ) {}

    public record OwnerForListing(Long id, String fullName, String phone, boolean verified, Instant memberSince, String avatarUrl) {}
}
