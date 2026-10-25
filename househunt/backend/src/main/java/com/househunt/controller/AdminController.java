package com.househunt.controller;

import com.househunt.dto.AdminDtos;
import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.Property;
import com.househunt.exception.ApiException;
import com.househunt.repository.PropertyRepository;
import com.househunt.service.AdminService;
import com.househunt.service.PropertyService;
import com.househunt.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final PropertyService propertyService;
    private final PropertyRepository propertyRepository;
    private final ReviewService reviewService;

    @GetMapping("/overview")
    public AdminDtos.Overview overview() { return adminService.overview(); }

    @GetMapping("/users")
    public AdminDtos.UsersPage users(@RequestParam(required = false) String role,
                                     @RequestParam(required = false) String q) {
        return adminService.users(role, q);
    }

    @PutMapping("/users/{id}/active")
    public AdminDtos.AdminUser setActive(@PathVariable Long id, @RequestParam boolean active) {
        return adminService.setActive(id, active);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) { adminService.deleteUser(id); }

    @GetMapping("/properties")
    public PropertyDtos.PageResult<PropertyDtos.PropertyCard> allProperties(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q) {
        Property.Status st = null;
        if (status != null && !status.isBlank()) {
            try { st = Property.Status.valueOf(status.toUpperCase()); } catch (Exception e) { throw ApiException.badRequest("Unknown status"); }
        }
        PropertyDtos.SearchRequest req = new PropertyDtos.SearchRequest(q, null, null, null,
                null, null, null, null, null, null, "newest", st);
        return propertyService.search(req, page, size, true);
    }

    @GetMapping("/moderation")
    public List<PropertyDtos.PropertyCard> moderation() {
        return adminService.moderationQueue();
    }

    @PutMapping("/properties/{id}/status")
    public void changeStatus(@PathVariable Long id, @RequestParam String status,
                             @RequestParam(required = false) String reason) {
        Property.Status st = Property.Status.valueOf(status.toUpperCase());
        propertyService.changeStatus(id, st, reason);
    }

    @PutMapping("/properties/{id}/feature")
    public void setFeatured(@PathVariable Long id, @RequestParam boolean featured) {
        propertyService.toggleFeatured(id, featured);
    }

    @DeleteMapping("/properties/{id}")
    public void deleteProperty(@PathVariable Long id) { propertyService.delete(id); }

    @GetMapping("/reports/locations")
    public List<AdminDtos.LocationReport> locationReports() { return adminService.locationReports(); }

    @GetMapping("/reviews/pending")
    public List<EngagementDtos.ReviewDto> pendingReviews() { return adminService.pendingReviews(); }

    @PutMapping("/reviews/{id}/moderate")
    public void moderateReview(@PathVariable Long id, @RequestParam boolean approve) {
        reviewService.moderate(id, approve);
    }
}
