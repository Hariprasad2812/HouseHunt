package com.househunt.dto;

public final class AmenityDtos {
    public record AmenityDto(Long id, String name, String slug, String category, String icon) {}
}
