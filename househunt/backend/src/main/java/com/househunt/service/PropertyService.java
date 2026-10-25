package com.househunt.service;

import com.househunt.dto.*;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.*;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final LocationRepository locationRepository;
    private final AmenityRepository amenityRepository;
    private final FavoriteRepository favoriteRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;
    private final ReviewRepository reviewRepository;
    private final MessageRepository messageRepository;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    // ---------------------------------------------------------------- search

    @Transactional(readOnly = true)
    public PropertyDtos.PageResult<PropertyDtos.PropertyCard> search(PropertyDtos.SearchRequest req,
                                                                      int page, int size,
                                                                      boolean adminMode) {
        Specification<Property> spec = publicSpec(req, adminMode);
        Sort sort = sortFor(req == null ? null : req.sort());
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 48)), sort);
        Page<Property> result = propertyRepository.findAll(spec, pageable);
        User viewer = securityUtil.currentUserOrNull();
        List<PropertyDtos.PropertyCard> cards = result.getContent().stream()
                .map(p -> Mappers.card(p, isFav(viewer, p)))
                .toList();
        return new PropertyDtos.PageResult<>(cards, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<PropertyDtos.PropertyCard> featured() {
        return propertyRepository.findTop8ByStatusAndIsAvailableTrueOrderByFeaturedDescPublishedAtDesc(Property.Status.APPROVED)
                .stream().map(p -> Mappers.card(p, false)).toList();
    }

    private boolean isFav(User viewer, Property p) {
        return viewer != null && favoriteRepository.existsByUserAndProperty(viewer, p);
    }

    private Specification<Property> publicSpec(PropertyDtos.SearchRequest r, boolean adminMode) {
        Specification<Property> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (r != null && adminMode && r.status() != null) {
                ps.add(cb.equal(root.get("status"), r.status()));
            } else if (!adminMode) {
                ps.add(cb.equal(root.get("status"), Property.Status.APPROVED));
                ps.add(cb.isTrue(root.get("isAvailable")));
            }
            if (r == null) return cb.and(ps.toArray(new Predicate[0]));
            if (r.q() != null && !r.q().isBlank()) {
                String q = "%" + r.q().trim().toLowerCase() + "%";
                ps.add(cb.or(cb.like(cb.lower(root.get("title")), q),
                        cb.like(cb.lower(root.get("address")), q)));
            }
            if (r.locationSlug() != null && !r.locationSlug().isBlank()) {
                ps.add(cb.equal(root.get("location").get("slug"), r.locationSlug()));
            }
            if (r.minRent() != null) ps.add(cb.greaterThanOrEqualTo(root.get("rentPerMonth"), r.minRent()));
            if (r.maxRent() != null) ps.add(cb.lessThanOrEqualTo(root.get("rentPerMonth"), r.maxRent()));
            if (r.type() != null) ps.add(cb.equal(root.get("type"), r.type()));
            if (r.bedrooms() != null) {
                ps.add(r.bedrooms() >= 4
                        ? cb.greaterThanOrEqualTo(root.get("bedrooms"), r.bedrooms())
                        : cb.equal(root.get("bedrooms"), r.bedrooms()));
            }
            if (r.bathrooms() != null) ps.add(cb.equal(root.get("bathrooms"), r.bathrooms()));
            if (r.furnishing() != null) ps.add(cb.equal(root.get("furnishing"), r.furnishing()));
            if (r.amenityIds() != null && !r.amenityIds().isEmpty()) {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<Property> subRoot = sub.from(Property.class);
                sub.select(subRoot.get("id"));
                sub.where(subRoot.join("amenities").get("id").in(r.amenityIds()));
                sub.groupBy(subRoot.get("id"));
                sub.having(cb.ge(cb.count(subRoot), (long) r.amenityIds().size()));
                ps.add(root.get("id").in(sub));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
        return spec;
    }

    private Sort sortFor(String sort) {
        return switch (sort == null ? "newest" : sort) {
            case "price_asc" -> Sort.by("rentPerMonth").ascending();
            case "price_desc" -> Sort.by("rentPerMonth").descending();
            case "views" -> Sort.by("viewCount").descending();
            case "area" -> Sort.by("floorAreaSqft").descending();
            default -> Sort.by(Sort.Order.desc("featured"), Sort.Order.desc("publishedAt"));
        };
    }

    // ---------------------------------------------------------------- detail

    @Transactional
    public PropertyDtos.PropertyDetail detail(Long id) {
        Property p = getApprovedOrOwned(id);
        User viewer = securityUtil.currentUserOrNull();
        if (viewer == null || !Objects.equals(p.getOwner().getId(), viewer.getId())) {
            p.setViewCount(p.getViewCount() + 1);
            propertyRepository.save(p);
        }
        PropertyDtos.ReviewSummary reviews = new PropertyDtos.ReviewSummary(
                reviewRepository.avgForProperty(id), reviewRepository.countByProperty_Id(id));
        return new PropertyDtos.PropertyDetail(
                Mappers.card(p, isFav(viewer, p)),
                p.getDescription(), p.getMaintenancePerMonth(), p.isPetAllowed(),
                p.getLeaseTerm(), p.getHouseRules(), p.getAvailableFrom(),
                p.getImages().stream().map(PropertyImage::getUrl).toList(),
                Mappers.amenities(p.getAmenities()),
                Mappers.owner(p.getOwner()),
                reviews);
    }

    private Property getApprovedOrOwned(Long id) {
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        User viewer = securityUtil.currentUserOrNull();
        if (p.getStatus() != Property.Status.APPROVED) {
            boolean ownerOrAdmin = viewer != null &&
                    (viewer.getRole() == Role.ADMIN || Objects.equals(p.getOwner().getId(), viewer.getId()));
            if (!ownerOrAdmin) throw ApiException.notFound("Property not found");
        }
        return p;
    }

    // ------------------------------------------------------------- owner CRUD

    @Transactional
    public PropertyDtos.PropertyDetail create(PropertyDtos.PropertyRequest req) {
        User owner = securityUtil.requireUser();
        if (owner.getRole() == Role.TENANT) {
            throw ApiException.forbidden("Only owner accounts can list properties. Create an owner account or switch account type.");
        }
        Property p = mapToEntity(new Property(), req);
        p.setOwner(owner);
        boolean autoApproved = owner.getRole() == Role.ADMIN;
        p.setStatus(autoApproved ? Property.Status.APPROVED : Property.Status.PENDING);
        p.setVerified(autoApproved);
        if (autoApproved) p.setPublishedAt(Instant.now());
        propertyRepository.save(p);
        notificationService.notify(owner, Notification.Type.LISTING,
                autoApproved ? "Listing published" : "Listing submitted for review",
                autoApproved ? p.getTitle() + " is now live on HouseHunt."
                             : "We're verifying " + p.getTitle() + ". It usually takes under 24 hours.",
                "/owner/properties/" + p.getId());
        return detail(p.getId());
    }

    @Transactional
    public PropertyDtos.PropertyDetail update(Long id, PropertyDtos.PropertyRequest req) {
        User actor = securityUtil.requireUser();
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        boolean allowed = actor.getRole() == Role.ADMIN || p.getOwner().getId().equals(actor.getId());
        if (!allowed) throw ApiException.forbidden("You can only edit your own listings.");
        mapToEntity(p, req);
        p.setUpdatedAt(Instant.now());
        propertyRepository.save(p);
        return detail(id);
    }

    private Property mapToEntity(Property p, PropertyDtos.PropertyRequest req) {
        p.setTitle(req.title().trim());
        p.setDescription(req.description().trim());
        p.setType(req.type());
        p.setFurnishing(req.furnishing());
        p.setAddress(req.address().trim());
        p.setLat(req.lat() == null ? 12.9716 : req.lat());
        p.setLng(req.lng() == null ? 77.5946 : req.lng());
        p.setRentPerMonth(req.rentPerMonth());
        p.setDeposit(req.deposit() == null ? 0 : req.deposit());
        p.setMaintenancePerMonth(req.maintenancePerMonth() == null ? 0 : req.maintenancePerMonth());
        p.setFloorAreaSqft(req.floorAreaSqft());
        p.setBedrooms(req.bedrooms());
        p.setBathrooms(req.bathrooms());
        p.setBalconies(req.balconies() == null ? 0 : req.balconies());
        p.setAvailableFrom(req.availableFrom());
        p.setPetAllowed(req.petAllowed());
        p.setLeaseTerm(req.leaseTerm() == null ? "11 months" : req.leaseTerm());
        p.setHouseRules(req.houseRules());
        p.setAvailable(req.isAvailable() == null || req.isAvailable());
        p.setLocation(locationRepository.findBySlug(req.locationSlug())
                .orElseThrow(() -> ApiException.badRequest("Unknown location: " + req.locationSlug())));
        if (req.imageUrls() != null && !req.imageUrls().isEmpty()) {
            p.getImages().clear();
            int i = 0;
            for (String url : req.imageUrls()) {
                if (url == null || url.isBlank()) continue;
                PropertyImage img = new PropertyImage();
                img.setUrl(url.trim());
                img.setAltText(p.getTitle());
                img.setSortOrder(i);
                img.setCover(i == 0);
                img.setProperty(p);
                p.getImages().add(img);
                i++;
            }
        }
        Set<Amenity> ams = new HashSet<>();
        if (req.amenityIds() != null && !req.amenityIds().isEmpty()) {
            ams.addAll(amenityRepository.findByIdIn(new HashSet<>(req.amenityIds())));
        }
        p.setAmenities(ams);
        return p;
    }

    @Transactional
    public void delete(Long id) {
        User actor = securityUtil.requireUser();
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        boolean allowed = actor.getRole() == Role.ADMIN || p.getOwner().getId().equals(actor.getId());
        if (!allowed) throw ApiException.forbidden("You can only delete your own listings.");
        purgeReferences(p);
        propertyRepository.delete(p);
    }

    private void purgeReferences(Property p) {
        applicationRepository.deleteByProperty(p);
        visitRepository.deleteByProperty(p);
        messageRepository.deleteByProperty(p);
        favoriteRepository.deleteByProperty(p);
        reviewRepository.deleteByProperty(p);
        // images are cascade-deleted with the property
    }

    // ------------------------------------------------------------ moderation

    @Transactional
    public void changeStatus(Long id, Property.Status status, String reason) {
        User actor = securityUtil.requireUser();
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        if (status == Property.Status.APPROVED || status == Property.Status.REJECTED) {
            if (actor.getRole() != Role.ADMIN) throw ApiException.forbidden("Only admins can approve or reject listings.");
        } else if (status == Property.Status.SUSPENDED) {
            boolean allowed = actor.getRole() == Role.ADMIN || p.getOwner().getId().equals(actor.getId());
            if (!allowed) throw ApiException.forbidden("Not allowed to suspend this listing.");
        }
        Property.Status prev = p.getStatus();
        p.setStatus(status);
        p.setUpdatedAt(Instant.now());
        if (status == Property.Status.APPROVED) {
            p.setVerified(true);
            if (p.getPublishedAt() == null) p.setPublishedAt(Instant.now());
            p.setAvailable(true);
        }
        propertyRepository.save(p);
        String verb = switch (status) {
            case APPROVED -> "was approved and is now live";
            case REJECTED -> "was not approved. Reason: " + (reason == null ? "please edit and resubmit" : reason);
            case SUSPENDED -> "was suspended. Reason: " + (reason == null ? "contact support" : reason);
            default -> "status updated to " + status.name();
        };
        notificationService.notify(p.getOwner(), Notification.Type.LISTING, "Listing " + status.name().toLowerCase(),
                "\"" + p.getTitle() + "\" " + verb + ".", "/owner/properties/" + p.getId());
    }

    @Transactional
    public void toggleFeatured(Long id, boolean featured) {
        Property p = propertyRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        p.setFeatured(featured);
        propertyRepository.save(p);
    }

    // ------------------------------------------------------------ my listing

    @Transactional(readOnly = true)
    public List<PropertyDtos.PropertyCard> mine() {
        User owner = securityUtil.requireUser();
        return propertyRepository.findAllByOwner(owner).stream().map(p -> Mappers.card(p, false)).toList();
    }
}
