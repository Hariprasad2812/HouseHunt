package com.househunt.dto;

import com.househunt.entity.Property;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class PropertyDtos {

    public record PropertyRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(max = 4000) String description,
            @NotNull Property.PropertyType type,
            @NotNull Property.Furnishing furnishing,
            @NotBlank String locationSlug,
            @NotBlank @Size(max = 500) String address,
            Double lat, Double lng,
            @NotNull @Min(1000) @Max(5_000_000) Integer rentPerMonth,
            @Min(0) Integer deposit,
            @Min(0) Integer maintenancePerMonth,
            @NotNull @Min(100) @Max(100_000) Integer floorAreaSqft,
            @NotNull @Min(1) @Max(12) Integer bedrooms,
            @NotNull @Min(1) @Max(12) Integer bathrooms,
            @Min(0) Integer balconies,
            LocalDate availableFrom,
            boolean petAllowed,
            String leaseTerm,
            String houseRules,
            List<@Size(max = 700) String> imageUrls,
            List<Long> amenityIds,
            Boolean isAvailable
    ) {}

    public record ReviewSummary(double rating, long count) {}

    public record PropertyCard(
            Long id, String title, Property.PropertyType type, Property.Furnishing furnishing,
            int rentPerMonth, int deposit, int floorAreaSqft, int bedrooms, int bathrooms,
            String address, Long locationId, String locationName, String locationSlug,
            double lat, double lng, String coverImage, int imageCount,
            boolean verified, boolean featured, boolean isAvailable, String status,
            long views, Instant publishedAt, Instant createdAt, boolean favorited,
            List<AmenityDtos.AmenityDto> topAmenities
    ) {}

    public record PropertyDetail(
            PropertyCard card,
            String description,
            int maintenancePerMonth,
            boolean petAllowed,
            String leaseTerm,
            String houseRules,
            LocalDate availableFrom,
            List<String> imageUrls,
            List<AmenityDtos.AmenityDto> amenities,
            AuthDtos.OwnerForListing owner,
            ReviewSummary reviews
    ) {}

    public record PageResult<T>(List<T> content, int page, int size, long totalElements, int totalPages) {}

    public record SearchRequest(
            String q, String locationSlug, Integer minRent, Integer maxRent,
            Property.PropertyType type, Integer bedrooms, Integer bathrooms,
            Property.Furnishing furnishing, List<Long> amenityIds,
            Boolean isAvailable, String sort,
            Property.Status status
    ) {}
}
