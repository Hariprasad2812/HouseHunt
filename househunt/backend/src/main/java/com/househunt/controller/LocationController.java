package com.househunt.controller;

import com.househunt.dto.LocationDtos;
import com.househunt.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public List<LocationDtos.LocationDto> all() {
        return locationService.all();
    }

    @GetMapping("/{slug}")
    public LocationDtos.LocationDto bySlug(@PathVariable String slug) {
        return locationService.bySlug(slug);
    }
}
