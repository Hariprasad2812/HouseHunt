package com.househunt.controller;

import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.Property;
import com.househunt.service.ApplicationService;
import com.househunt.service.FavoriteService;
import com.househunt.service.PropertyService;
import com.househunt.service.ReviewService;
import com.househunt.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final FavoriteService favoriteService;
    private final ReviewService reviewService;
    private final VisitService visitService;
    private final ApplicationService applicationService;

    @GetMapping
    public PropertyDtos.PageResult<PropertyDtos.PropertyCard> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minRent,
            @RequestParam(required = false) Integer maxRent,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer bathrooms,
            @RequestParam(required = false) String furnishing,
            @RequestParam(required = false) List<Long> amenities,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        PropertyDtos.SearchRequest req = new PropertyDtos.SearchRequest(q, location,
                minRent, maxRent, parseEnum(Property.PropertyType.class, type),
                bedrooms, bathrooms, parseEnum(Property.Furnishing.class, furnishing),
                amenities, available, sort, null);
        return propertyService.search(req, page, size, false);
    }

    @GetMapping("/featured")
    public List<PropertyDtos.PropertyCard> featured() {
        return propertyService.featured();
    }

    @GetMapping("/{id}")
    public PropertyDtos.PropertyDetail detail(@PathVariable Long id) {
        return propertyService.detail(id);
    }

    @GetMapping("/{id}/reviews")
    public List<EngagementDtos.ReviewDto> reviews(@PathVariable Long id) {
        return reviewService.forProperty(id);
    }

    @PostMapping
    public PropertyDtos.PropertyDetail create(@Valid @RequestBody PropertyDtos.PropertyRequest req) {
        return propertyService.create(req);
    }

    @PutMapping("/{id}")
    public PropertyDtos.PropertyDetail update(@PathVariable Long id,
                                              @Valid @RequestBody PropertyDtos.PropertyRequest req) {
        return propertyService.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        propertyService.delete(id);
    }

    @PostMapping("/{id}/favorite")
    public EngagementDtos.FavoriteAction toggleFavorite(@PathVariable Long id) {
        return favoriteService.toggle(id);
    }

    @GetMapping("/{id}/favorite")
    public EngagementDtos.FavoriteAction favState(@PathVariable Long id) {
        return new EngagementDtos.FavoriteAction(!favoriteService.mine().stream().noneMatch(c -> c.id().equals(id)));
    }

    @PostMapping("/{id}/reviews")
    public EngagementDtos.ReviewDto createReview(@PathVariable Long id,
                                                 @Valid @RequestBody EngagementDtos.ReviewRequest req) {
        return reviewService.create(id, req);
    }

    @PostMapping("/{id}/visits")
    public EngagementDtos.VisitDto requestVisit(@PathVariable Long id,
                                                @Valid @RequestBody EngagementDtos.VisitRequest req) {
        return visitService.request(new EngagementDtos.VisitRequest(id, req.scheduledAt(), req.mode(), req.note()));
    }

    @PostMapping("/{id}/applications")
    public EngagementDtos.ApplicationDto apply(@PathVariable Long id,
                                               @Valid @RequestBody EngagementDtos.ApplicationRequest req) {
        return applicationService.apply(new EngagementDtos.ApplicationRequest(id, req.message(), req.moveInDate()));
    }

    private static <T extends Enum<T>> T parseEnum(Class<T> type, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(type, value.toUpperCase().trim()); } catch (IllegalArgumentException e) { return null; }
    }
}
