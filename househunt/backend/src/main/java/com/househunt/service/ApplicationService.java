package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.ApplicationRepository;
import com.househunt.repository.PropertyRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    @Transactional
    public EngagementDtos.ApplicationDto apply(EngagementDtos.ApplicationRequest req) {
        User me = securityUtil.requireUser();
        Property p = propertyRepository.findById(req.propertyId())
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        if (p.getStatus() != Property.Status.APPROVED) throw ApiException.badRequest("This listing is not accepting applications.");
        if (p.getOwner().getId().equals(me.getId())) throw ApiException.badRequest("You can't apply to your own listing.");
        if (applicationRepository.findFirstByUserAndProperty(me, p).isPresent()) {
            throw ApiException.conflict("You already applied to this home. The owner will respond shortly.");
        }
        Application a = new Application();
        a.setUser(me);
        a.setProperty(p);
        a.setMessage(req.message() == null ? "" : req.message());
        a.setMoveInDate(req.moveInDate());
        a.setStatus(Application.Status.PENDING);
        applicationRepository.save(a);
        notificationService.notify(p.getOwner(), Notification.Type.APPLICATION,
                "New rental application",
                me.getFullName() + " applied for \"" + p.getTitle() + "\".",
                "/owner/applications");
        return Mappers.application(a);
    }

    @Transactional
    public EngagementDtos.ApplicationDto updateStatus(Long applicationId, Application.Status status) {
        User actor = securityUtil.requireUser();
        Application a = applicationRepository.findById(applicationId)
                .orElseThrow(() -> ApiException.notFound("Application not found"));
        boolean allowed = actor.getRole() == Role.ADMIN || a.getProperty().getOwner().getId().equals(actor.getId())
                || (status == Application.Status.WITHDRAWN && a.getUser().getId().equals(actor.getId()));
        if (!allowed) throw ApiException.forbidden("Not allowed to update this application.");
        a.setStatus(status);
        a.setUpdatedAt(Instant.now());
        applicationRepository.save(a);
        notificationService.notify(a.getUser(), Notification.Type.APPLICATION,
                "Application " + status.name().toLowerCase(),
                "Your application for \"" + a.getProperty().getTitle() + "\" is now " + status.name().toLowerCase() + ".",
                "/tenant/applications");
        return Mappers.application(a);
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.ApplicationDto> listMine() {
        User me = securityUtil.requireUser();
        return applicationRepository.findAllByUserOrderByCreatedAtDesc(me).stream().map(Mappers::application).toList();
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.ApplicationDto> listForOwner() {
        User me = securityUtil.requireUser();
        return applicationRepository.findAllByProperty_OwnerOrderByCreatedAtDesc(me).stream().map(Mappers::application).toList();
    }
}
