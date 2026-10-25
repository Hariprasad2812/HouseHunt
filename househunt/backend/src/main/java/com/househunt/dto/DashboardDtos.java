package com.househunt.dto;

import java.util.List;

public final class DashboardDtos {

    public record Stat(String key, long value, String label) {}

    public record TenantDashboard(
            String welcomeName,
            long savedCount, long applicationsCount, long visitsCount, long unreadMessages,
            List<PropertyDtos.PropertyCard> savedHomes,
            List<EngagementDtos.VisitDto> upcomingVisits,
            List<EngagementDtos.ApplicationDto> recentApplications,
            List<PropertyDtos.PropertyCard> recommended
    ) {}

    public record OwnerDashboard(
            long totalProperties, long activeListings, long pendingListings,
            long totalViews, long enquiries, long viewingRequests, long unreadMessages,
            List<PropertyDtos.PropertyCard> properties,
            List<EngagementDtos.ApplicationDto> recentApplications,
            List<EngagementDtos.VisitDto> upcomingVisits
    ) {}

    public record OwnerAnalytics(
            List<String> months,
            List<Long> applications, List<Long> visits,
            long totalViews, long topListingViews,
            String topListingTitle, long totalFavorites
    ) {}
}
