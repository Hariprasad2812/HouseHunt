package com.househunt.service;

import com.househunt.dto.LocationDtos;
import com.househunt.entity.Location;
import com.househunt.entity.Property;
import com.househunt.exception.ApiException;
import com.househunt.repository.LocationRepository;
import com.househunt.repository.PropertyRepository;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public List<LocationDtos.LocationDto> all() {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : propertyRepository.allApprovedCountsByLocation()) {
            counts.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return locationRepository.findAllByOrderBySortOrderAsc().stream()
                .map(l -> Mappers.location(l, counts.getOrDefault(l.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public LocationDtos.LocationDto bySlug(String slug) {
        Location l = locationRepository.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("Neighbourhood not found"));
        long count = propertyRepository.countByLocationAndStatus(l, Property.Status.APPROVED);
        return Mappers.location(l, count);
    }

    @Transactional(readOnly = true)
    public List<Location> entities() {
        return locationRepository.findAllByOrderBySortOrderAsc();
    }
}
