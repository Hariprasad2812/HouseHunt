package com.househunt.dto;

import com.househunt.entity.Role;
import com.househunt.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class UserDtos {

    public record UpdateProfileRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @NotBlank @Pattern(regexp = "^[0-9+\\- ]{7,15}$") String phone,
            @Size(max = 60) String city,
            @Size(max = 500) String avatarUrl
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 72) String newPassword
    ) {}

    public record ProfileResponse(
            Role role, User.AccountType accountType, boolean verified,
            String fullName, String email, String phone, String city, String avatarUrl,
            Instant createdAt, long unreadMessages
    ) {}
}
