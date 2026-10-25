package com.househunt.util;

import com.househunt.dto.*;
import com.househunt.entity.*;

import java.util.List;
import java.util.Set;

/** Pure mapping helpers between JPA entities and API DTOs. */
public final class Mappers {

    private Mappers() {}

    public static String coverOf(Property p) {
        return p.getImages().stream().filter(PropertyImage::isCover).findFirst()
                .or(() -> p.getImages().stream().findFirst())
                .map(PropertyImage::getUrl).orElse(null);
    }

    public static AmenityDtos.AmenityDto amenity(Amenity a) {
        return new AmenityDtos.AmenityDto(a.getId(), a.getName(), a.getSlug(), a.getCategory(), a.getIcon());
    }

    public static List<AmenityDtos.AmenityDto> amenities(Set<Amenity> set) {
        return set.stream().map(Mappers::amenity).toList();
    }

    public static LocationDtos.LocationDto location(Location l, long propertyCount) {
        return new LocationDtos.LocationDto(l.getId(), l.getName(), l.getSlug(), l.getRegion(),
                l.getDescription(), l.getImageUrl(), l.getLat(), l.getLng(),
                l.getAvgRentMin(), l.getAvgRentMax(), propertyCount);
    }

    public static PropertyDtos.PropertyCard card(Property p, boolean favorited) {
        Location l = p.getLocation();
        List<AmenityDtos.AmenityDto> tops = p.getAmenities().stream()
                .sorted((a, b) -> Integer.compare(b.getSortOrder(), a.getSortOrder()))
                .limit(3).map(Mappers::amenity).toList();
        return new PropertyDtos.PropertyCard(
                p.getId(), p.getTitle(), p.getType(), p.getFurnishing(),
                p.getRentPerMonth(), p.getDeposit(), p.getFloorAreaSqft(), p.getBedrooms(), p.getBathrooms(),
                p.getAddress(), l.getId(), l.getName(), l.getSlug(), p.getLat(), p.getLng(),
                coverOf(p), p.getImages().size(),
                p.isVerified(), p.isFeatured(), p.isAvailable(), p.getStatus().name(),
                p.getViewCount(), p.getPublishedAt(), p.getCreatedAt(), favorited, tops);
    }

    public static AuthDtos.PublicUser user(User u) {
        return new AuthDtos.PublicUser(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
                u.getRole(), u.getAccountType(), u.isVerified(), u.getAvatarUrl(), u.getCity(), u.getCreatedAt());
    }

    public static AuthDtos.OwnerForListing owner(User u) {
        return new AuthDtos.OwnerForListing(u.getId(), u.getFullName(), u.getPhone(), u.isVerified(),
                u.getCreatedAt(), u.getAvatarUrl());
    }

    public static EngagementDtos.ApplicationDto application(Application a) {
        Property p = a.getProperty();
        return new EngagementDtos.ApplicationDto(
                a.getId(), p.getId(), p.getTitle(), coverOf(p),
                p.getLocation() == null ? "" : p.getLocation().getName(), p.getRentPerMonth(),
                a.getStatus().name(), a.getMessage(), a.getMoveInDate(), a.getCreatedAt(),
                a.getUser().getFullName(), a.getUser().getPhone(), a.getUser().getEmail(), a.getUser().getId());
    }

    public static EngagementDtos.VisitDto visit(Visit v) {
        Property p = v.getProperty();
        return new EngagementDtos.VisitDto(
                v.getId(), p.getId(), p.getTitle(), coverOf(p), v.getScheduledAt(),
                v.getMode().name(), v.getStatus().name(), v.getNote(), v.getCreatedAt(),
                p.getLocation() == null ? "" : p.getLocation().getName(), p.getRentPerMonth());
    }

    public static EngagementDtos.MessageDto message(Message m) {
        return new EngagementDtos.MessageDto(m.getId(), m.getSender().getId(), m.getSender().getFullName(),
                m.getRecipient().getId(), m.getProperty() == null ? null : m.getProperty().getId(),
                m.getBody(), m.isRead(), m.getCreatedAt());
    }

    public static EngagementDtos.ReviewDto review(Review r) {
        return new EngagementDtos.ReviewDto(r.getId(), r.getProperty().getId(), r.getAuthor().getId(),
                r.getAuthor().getFullName(), r.getRating(), r.getComment(), r.isApproved(), r.getCreatedAt());
    }
}
