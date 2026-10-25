package com.househunt.dto;

public final class LocationDtos {
    public record LocationDto(Long id, String name, String slug, String region, String description,
                              String imageUrl, double lat, double lng,
                              int avgRentMin, int avgRentMax, long propertyCount) {}
}
