package com.househunt.controller;

import com.househunt.dto.AmenityDtos;
import com.househunt.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityService amenityService;

    @GetMapping
    public List<AmenityDtos.AmenityDto> all() {
        return amenityService.all();
    }
}
