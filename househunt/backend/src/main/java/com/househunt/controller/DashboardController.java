package com.househunt.controller;

import com.househunt.dto.DashboardDtos;
import com.househunt.entity.Role;
import com.househunt.entity.User;
import com.househunt.exception.ApiException;
import com.househunt.security.SecurityUtil;
import com.househunt.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtil securityUtil;

    @GetMapping("/tenant")
    public DashboardDtos.TenantDashboard tenant() {
        User me = securityUtil.requireUser();
        if (me.getRole() != Role.TENANT && me.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("This dashboard is for tenant accounts.");
        }
        return dashboardService.tenant();
    }

    @GetMapping("/owner")
    public DashboardDtos.OwnerDashboard owner() {
        User me = securityUtil.requireUser();
        if (me.getRole() != Role.OWNER && me.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("This dashboard is for owner accounts.");
        }
        return dashboardService.owner();
    }
}
