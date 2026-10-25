package com.househunt.controller;

import com.househunt.dto.DashboardDtos;
import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.Application;
import com.househunt.entity.Property;
import com.househunt.entity.Role;
import com.househunt.entity.User;
import com.househunt.entity.Visit;
import com.househunt.exception.ApiException;
import com.househunt.security.SecurityUtil;
import com.househunt.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final PropertyService propertyService;
    private final ApplicationService applicationService;
    private final VisitService visitService;
    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    private void requireOwner() {
        User me = securityUtil.requireUser();
        if (me.getRole() != Role.OWNER && me.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("Only owner accounts can access this.");
        }
    }

    @GetMapping("/properties")
    public List<PropertyDtos.PropertyCard> myProperties() {
        requireOwner();
        return propertyService.mine();
    }

    @PutMapping("/properties/{id}/pause")
    public PropertyDtos.PropertyCard pause(@PathVariable Long id) {
        requireOwner();
        propertyService.changeStatus(id, Property.Status.SUSPENDED, null);
        return propertyService.mine().stream().filter(c -> c.id().equals(id)).findFirst().orElseThrow();
    }

    @PutMapping("/properties/{id}/publish")
    public PropertyDtos.PropertyCard publish(@PathVariable Long id) {
        requireOwner();
        propertyService.changeStatus(id, Property.Status.PENDING, null);
        return propertyService.mine().stream().filter(c -> c.id().equals(id)).findFirst().orElseThrow();
    }

    @GetMapping("/applications")
    public List<EngagementDtos.ApplicationDto> applications() {
        requireOwner();
        return applicationService.listForOwner();
    }

    @PutMapping("/applications/{id}")
    public EngagementDtos.ApplicationDto updateApplication(@PathVariable Long id,
                                                           @RequestParam String status) {
        requireOwner();
        return applicationService.updateStatus(id, Application.Status.valueOf(status.toUpperCase()));
    }

    @GetMapping("/visits")
    public List<EngagementDtos.VisitDto> visits() {
        requireOwner();
        return visitService.listForOwner();
    }

    @PutMapping("/visits/{id}")
    public EngagementDtos.VisitDto updateVisit(@PathVariable Long id, @RequestParam String status) {
        requireOwner();
        return visitService.updateStatus(id, Visit.Status.valueOf(status.toUpperCase()));
    }

    @GetMapping("/analytics")
    public DashboardDtos.OwnerAnalytics analytics() {
        requireOwner();
        return dashboardService.analytics();
    }
}
