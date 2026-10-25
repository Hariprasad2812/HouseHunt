package com.househunt.controller;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.Role;
import com.househunt.entity.User;
import com.househunt.entity.Visit;
import com.househunt.security.SecurityUtil;
import com.househunt.service.VisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class VisitController {

    private final VisitService visitService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public EngagementDtos.VisitDto request(@Valid @RequestBody EngagementDtos.VisitRequest req) {
        return visitService.request(req);
    }

    @GetMapping
    public List<EngagementDtos.VisitDto> mine() {
        User me = securityUtil.requireUser();
        return me.getRole() == Role.OWNER
                ? visitService.listForOwner()
                : visitService.listMine();
    }

    @PutMapping("/{id}/status")
    public EngagementDtos.VisitDto update(@PathVariable Long id, @RequestParam String status) {
        return visitService.updateStatus(id, Visit.Status.valueOf(status.toUpperCase()));
    }
}
