package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.PropertyRepository;
import com.househunt.repository.VisitRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    @Transactional
    public EngagementDtos.VisitDto request(EngagementDtos.VisitRequest req) {
        User me = securityUtil.requireUser();
        Property p = propertyRepository.findById(req.propertyId())
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        if (p.getStatus() != Property.Status.APPROVED) throw ApiException.badRequest("This listing is not available.");
        if (req.scheduledAt().isBefore(LocalDateTime.now().plusHours(1))) {
            throw ApiException.badRequest("Please choose a time at least one hour from now.");
        }
        if (p.getOwner().getId().equals(me.getId())) throw ApiException.badRequest("You can't visit your own listing.");
        Visit v = new Visit();
        v.setUser(me);
        v.setProperty(p);
        v.setScheduledAt(req.scheduledAt());
        try {
            v.setMode(req.mode() == null ? Visit.Mode.IN_PERSON : Visit.Mode.valueOf(req.mode()));
        } catch (Exception e) {
            v.setMode(Visit.Mode.IN_PERSON);
        }
        v.setNote(req.note());
        v.setStatus(Visit.Status.REQUESTED);
        visitRepository.save(v);
        notificationService.notify(p.getOwner(), Notification.Type.VISIT,
                "New viewing request",
                me.getFullName() + " requested a viewing of \"" + p.getTitle() + "\".",
                "/owner/visits");
        return Mappers.visit(v);
    }

    @Transactional
    public EngagementDtos.VisitDto updateStatus(Long visitId, Visit.Status status) {
        User actor = securityUtil.requireUser();
        Visit v = visitRepository.findById(visitId)
                .orElseThrow(() -> ApiException.notFound("Visit not found"));
        boolean allowed = actor.getRole() == Role.ADMIN || v.getProperty().getOwner().getId().equals(actor.getId())
                || (status == Visit.Status.CANCELLED && v.getUser().getId().equals(actor.getId()));
        if (!allowed) throw ApiException.forbidden("Not allowed to update this visit.");
        v.setStatus(status);
        v.setUpdatedAt(java.time.Instant.now());
        visitRepository.save(v);
        notificationService.notify(v.getUser(), Notification.Type.VISIT,
                "Visit " + status.name().toLowerCase(),
                "Your visit to \"" + v.getProperty().getTitle() + "\" on " + v.getScheduledAt() + " is " + status.name().toLowerCase() + ".",
                "/tenant/visits");
        return Mappers.visit(v);
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.VisitDto> listMine() {
        User me = securityUtil.requireUser();
        return visitRepository.findAllByUserOrderByScheduledAtDesc(me).stream().map(Mappers::visit).toList();
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.VisitDto> listForOwner() {
        User me = securityUtil.requireUser();
        return visitRepository.findAllByProperty_OwnerOrderByScheduledAtDesc(me).stream().map(Mappers::visit).toList();
    }
}
