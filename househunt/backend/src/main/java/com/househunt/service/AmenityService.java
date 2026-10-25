package com.househunt.service;

import com.househunt.dto.AmenityDtos;
import com.househunt.repository.AmenityRepository;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmenityService {

    private final AmenityRepository amenityRepository;

    @Transactional(readOnly = true)
    public List<AmenityDtos.AmenityDto> all() {
        return amenityRepository.findAllByOrderByCategoryAscSortOrderAsc().stream().map(Mappers::amenity).toList();
    }
}
