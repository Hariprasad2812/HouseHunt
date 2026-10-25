package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.PropertyRepository;
import com.househunt.repository.ReviewRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public List<EngagementDtos.ReviewDto> forProperty(Long propertyId) {
        return reviewRepository.findAllByApprovedTrueAndProperty_IdOrderByCreatedAtDesc(propertyId)
                .stream().map(Mappers::review).toList();
    }

    @Transactional
    public EngagementDtos.ReviewDto create(Long propertyId, EngagementDtos.ReviewRequest req) {
        User me = securityUtil.requireUser();
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        Review r = new Review();
        r.setProperty(p);
        r.setAuthor(me);
        r.setRating(req.rating());
        r.setComment(req.comment());
        r.setApproved(false);
        reviewRepository.save(r);
        return Mappers.review(r);
    }

    @Transactional
    public void moderate(Long reviewId, boolean approve) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Review not found"));
        r.setApproved(approve);
        reviewRepository.save(r);
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.ReviewDto> pendingModeration() {
        return reviewRepository.findAll().stream()
                .filter(r -> !r.isApproved())
                .map(Mappers::review).toList();
    }
}
