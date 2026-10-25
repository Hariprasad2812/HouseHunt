package com.househunt.service;

import com.househunt.dto.AdminDtos;
import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.*;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final LocationRepository locationRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public AdminDtos.Overview overview() {
        long suspended = propertyRepository.countByStatus(Property.Status.SUSPENDED);
        long rejected = propertyRepository.countByStatus(Property.Status.REJECTED);
        long approved = propertyRepository.countByStatus(Property.Status.APPROVED);
        return new AdminDtos.Overview(
                userRepository.count(),
                userRepository.countByRole(Role.TENANT),
                userRepository.countByRole(Role.OWNER),
                propertyRepository.count(),
                approved,
                propertyRepository.countByStatus(Property.Status.PENDING),
                rejected,
                suspended,
                propertyRepository.totalViewsAll(),
                applicationRepository.count(),
                visitRepository.count(),
                reviewRepository.count(),
                pendingReviews().size());
    }

    @Transactional(readOnly = true)
    public AdminDtos.UsersPage users(String role, String q) {
        List<User> all = (q == null || q.isBlank()) ? userRepository.findAll()
                : userRepository.search(q);
        if (role != null && !role.isBlank()) {
            try {
                Role r = Role.valueOf(role.toUpperCase());
                all = all.stream().filter(u -> u.getRole() == r).toList();
            } catch (IllegalArgumentException ignore) { }
        }
        all = all.stream().sorted(Comparator.comparing(User::getCreatedAt).reversed()).toList();
        List<AdminDtos.AdminUser> dtos = all.stream().map(u -> new AdminDtos.AdminUser(
                u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getRole(),
                u.getAccountType().name(), u.isVerified(), u.isActive(), u.getCreatedAt(),
                u.getRole() == Role.OWNER ? propertyRepository.countByOwner(u) : 0)).toList();
        return new AdminDtos.UsersPage(dtos, dtos.size(),
                dtos.stream().filter(d -> d.role() == Role.TENANT).count(),
                dtos.stream().filter(d -> d.role() == Role.OWNER).count());
    }

    @Transactional
    public AdminDtos.AdminUser setActive(Long userId, boolean active) {
        User actor = securityUtil.requireUser();
        if (actor.getId().equals(userId)) throw ApiException.badRequest("You can't change your own account state here.");
        User u = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        u.setActive(active);
        userRepository.save(u);
        return new AdminDtos.AdminUser(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
                u.getRole(), u.getAccountType().name(), u.isVerified(), u.isActive(),
                u.getCreatedAt(), u.getRole() == Role.OWNER ? propertyRepository.countByOwner(u) : 0);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User actor = securityUtil.requireUser();
        if (actor.getId().equals(userId)) throw ApiException.badRequest("You can't delete your own account.");
        User u = userRepository.findById(userId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (u.getRole() == Role.ADMIN) throw ApiException.forbidden("Admin accounts cannot be deleted.");
        for (Property p : propertyRepository.findAllByOwner(u)) {
            purgePropertyData(p);
            propertyRepository.delete(p);
        }
        applicationRepository.deleteByUser(u);
        visitRepository.deleteByUser(u);
        favoriteRepository.deleteByUser(u);
        messageRepository.deleteBySender(u);
        messageRepository.deleteByRecipient(u);
        reviewRepository.deleteByAuthor(u);
        notificationRepository.deleteByUser(u);
        userRepository.delete(u);
    }

    private void purgePropertyData(Property p) {
        applicationRepository.deleteByProperty(p);
        visitRepository.deleteByProperty(p);
        messageRepository.deleteByProperty(p);
        favoriteRepository.deleteByProperty(p);
        reviewRepository.deleteByProperty(p);
    }

    @Transactional(readOnly = true)
    public List<PropertyDtos.PropertyCard> moderationQueue() {
        return propertyRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(p -> p.getStatus() == Property.Status.PENDING || p.getStatus() == Property.Status.SUSPENDED)
                .limit(60)
                .map(p -> Mappers.card(p, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.LocationReport> locationReports() {
        List<AdminDtos.LocationReport> reports = new ArrayList<>();
        for (Location l : locationRepository.findAllByOrderBySortOrderAsc()) {
            reports.add(new AdminDtos.LocationReport(l.getName(),
                    propertyRepository.countByLocationAndStatus(l, Property.Status.APPROVED),
                    l.getAvgRentMin(), l.getAvgRentMax()));
        }
        reports.sort(Comparator.comparing(AdminDtos.LocationReport::activeListings).reversed());
        return reports;
    }

    @Transactional(readOnly = true)
    public AdminDtos.ModerationQueue queueStats() {
        return new AdminDtos.ModerationQueue(
                propertyRepository.countByStatus(Property.Status.PENDING),
                propertyRepository.countByStatus(Property.Status.SUSPENDED),
                reviewRepository.countByApproved(false),
                propertyRepository.countByStatus(Property.Status.REJECTED));
    }

    @Transactional(readOnly = true)
    public List<EngagementDtos.ReviewDto> pendingReviews() {
        return reviewRepository.findAll().stream()
                .filter(r -> !r.isApproved())
                .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
                .limit(40)
                .map(r -> new EngagementDtos.ReviewDto(r.getId(), r.getProperty().getId(),
                        r.getAuthor().getId(), r.getAuthor().getFullName(), r.getRating(),
                        r.getComment(), r.isApproved(), r.getCreatedAt()))
                .toList();
    }
}
