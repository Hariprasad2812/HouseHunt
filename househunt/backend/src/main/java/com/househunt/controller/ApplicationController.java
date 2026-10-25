package com.househunt.controller;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.Application;
import com.househunt.entity.Role;
import com.househunt.entity.User;
import com.househunt.security.SecurityUtil;
import com.househunt.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final SecurityUtil securityUtil;

    /** POST with { propertyId, message?, moveInDate? } — always applies via authenticated user */
    @PostMapping
    public EngagementDtos.ApplicationDto apply(@Valid @RequestBody EngagementDtos.ApplicationRequest req) {
        return applicationService.apply(req);
    }

    @GetMapping
    public List<EngagementDtos.ApplicationDto> mine() {
        User me = securityUtil.requireUser();
        return me.getRole() == Role.OWNER
                ? applicationService.listForOwner()
                : applicationService.listMine();
    }

    @PutMapping("/{id}/status")
    public EngagementDtos.ApplicationDto update(@PathVariable Long id,
                                                @RequestParam String status) {
        return applicationService.updateStatus(id, Application.Status.valueOf(status.toUpperCase()));
    }
}
