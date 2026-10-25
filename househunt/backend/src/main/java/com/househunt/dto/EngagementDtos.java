package com.househunt.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDateTime;

public final class EngagementDtos {

    public record FavoriteAction(boolean favorited) {}

    public record VisitRequest(
            @NotNull Long propertyId,
            @NotNull LocalDateTime scheduledAt,
            String mode,
            @Size(max = 1500) String note
    ) {}

    public record VisitDto(Long id, Long propertyId, String propertyTitle, String coverImage,
                           LocalDateTime scheduledAt, String mode, String status, String note,
                           Instant createdAt, String propertyLocation, int rentPerMonth) {}

    public record ApplyRequest(@NotNull Long propertyId) {}

    public record ApplicationRequest(
            @NotNull Long propertyId,
            @Size(max = 2000) String message,
            java.time.LocalDate moveInDate
    ) {}

    public record ApplicationDto(Long id, Long propertyId, String propertyTitle, String coverImage,
                                 String locationName, int rentPerMonth, String status,
                                 String message, java.time.LocalDate moveInDate,
                                 Instant createdAt,
                                 String applicantName, String applicantPhone, String applicantEmail,
                                 Long applicantId) {}

    public record ApplicationAction(String status, String note) {}

    public record MessageRequest(@NotNull Long recipientId, Long propertyId,
                                 @NotBlank @Size(max = 3000) String body) {}

    public record MessageDto(Long id, Long senderId, String senderName, Long recipientId,
                             Long propertyId, String body, boolean read, Instant createdAt) {}

    public record ReviewRequest(@NotNull @Min(1) @Max(5) Integer rating, @Size(max = 2000) String comment) {}

    public record ReviewDto(Long id, Long propertyId, Long authorId, String authorName,
                            int rating, String comment, boolean approved, Instant createdAt) {}

    public record ThreadDto(Long peerId, String peerName, String peerAvatar,
                            String lastBody, Instant lastAt, long unread) {}
}
