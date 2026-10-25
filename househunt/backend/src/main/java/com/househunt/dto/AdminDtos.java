package com.househunt.dto;

import com.househunt.entity.Role;

import java.time.Instant;
import java.util.List;

public final class AdminDtos {

    public record Overview(
            long totalUsers, long totalTenants, long totalOwners,
            long totalProperties, long activeListings, long pendingListings,
            long rejectedListings, long suspendedListings, long totalViews,
            long totalApplications, long totalVisits, long totalReviews,
            long unreadReports
    ) {}

    public record AdminUser(Long id, String fullName, String email, String phone,
                            Role role, String accountType, boolean verified, boolean active,
                            Instant createdAt, long propertyCount) {}

    public record UsersPage(List<AdminUser> content, long total, long tenants, long owners) {}

    public record StatusChange(String status, String reason) {}

    public record ReviewModeration(Long reviewId, boolean approve) {}

    public record AnalyticsSeries(String period, long newUsers, long newListings, long views,
                                  long applications, long visits, long messages) {}

    public record Analytics(List<AnalyticsSeries> series, long totalUsers, long totalListings, long totalViews) {}

    public record LocationReport(String name, long activeListings, int avgRentMin, int avgRentMax) {}

    public record ModerationQueue(long pending, long suspended, long reviewsPending, long unverified) {}
}
