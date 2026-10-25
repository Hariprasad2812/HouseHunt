package com.househunt.service;

import com.househunt.dto.DashboardDtos;
import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.*;
import com.househunt.repository.*;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PropertyRepository propertyRepository;
    private final FavoriteRepository favoriteRepository;
    private final ApplicationRepository applicationRepository;
    private final VisitRepository visitRepository;
    private final MessageRepository messageRepository;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public DashboardDtos.TenantDashboard tenant() {
        User me = securityUtil.requireUser();

        List<PropertyDtos.PropertyCard> saved = favoriteRepository.findPropertiesByUser(me).stream()
                .limit(4).map(p -> Mappers.card(p, true)).toList();
        Set<Long> appliedIds = applicationRepository.findAllByUserOrderByCreatedAtDesc(me).stream()
                .map(a -> a.getProperty().getId()).collect(Collectors.toSet());
        Set<Long> savedIds = saved.stream().map(PropertyDtos.PropertyCard::id).collect(Collectors.toSet());

        List<EngagementDtos.VisitDto> upcoming = visitRepository.findAllByUserOrderByScheduledAtDesc(me).stream()
                .filter(v -> (v.getStatus() == Visit.Status.REQUESTED || v.getStatus() == Visit.Status.CONFIRMED)
                        && v.getScheduledAt().isAfter(LocalDateTime.now()))
                .sorted(Comparator.comparing(Visit::getScheduledAt))
                .limit(3).map(Mappers::visit).toList();

        List<EngagementDtos.ApplicationDto> recentApps = applicationRepository.findAllByUserOrderByCreatedAtDesc(me).stream()
                .limit(3).map(Mappers::application).toList();

        List<PropertyDtos.PropertyCard> recommended = new ArrayList<>();
        List<Property> pool = propertyRepository.findTop8ByStatusAndIsAvailableTrueOrderByFeaturedDescPublishedAtDesc(Property.Status.APPROVED);
        for (Property p : pool) {
            if (recommended.size() == 4) break;
            if (appliedIds.contains(p.getId())) continue;
            recommended.add(Mappers.card(p, savedIds.contains(p.getId())));
        }
        if (recommended.size() < 4) {
            List<Property> fallback = propertyRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 20)).getContent();
            for (Property p : fallback) {
                if (recommended.size() == 4) break;
                if (recommended.stream().anyMatch(c -> c.id().equals(p.getId()))) continue;
                if (p.getStatus() != Property.Status.APPROVED || !p.isAvailable()) continue;
                recommended.add(Mappers.card(p, false));
            }
        }

        return new DashboardDtos.TenantDashboard(
                me.getFullName().split(" ")[0],
                favoriteRepository.countByUser(me),
                applicationRepository.countByUser(me),
                visitRepository.countByUser(me),
                messageRepository.unreadCount(me),
                saved, upcoming, recentApps, recommended);
    }

    @Transactional(readOnly = true)
    public DashboardDtos.OwnerDashboard owner() {
        User me = securityUtil.requireUser();
        List<PropertyDtos.PropertyCard> props = propertyRepository.findAllByOwner(me).stream()
                .map(p -> Mappers.card(p, false)).toList();
        long active = propertyRepository.countByOwnerAndStatus(me, Property.Status.APPROVED);
        long pending = propertyRepository.countByOwnerAndStatus(me, Property.Status.PENDING);

        List<EngagementDtos.ApplicationDto> recentApps = applicationRepository.findAllByProperty_OwnerOrderByCreatedAtDesc(me).stream()
                .limit(4).map(Mappers::application).toList();

        List<EngagementDtos.VisitDto> upcoming = visitRepository.findAllByProperty_OwnerOrderByScheduledAtDesc(me).stream()
                .filter(v -> v.getStatus() == Visit.Status.REQUESTED || v.getStatus() == Visit.Status.CONFIRMED)
                .limit(4).map(Mappers::visit).toList();

        return new DashboardDtos.OwnerDashboard(
                props.size(), active, pending,
                propertyRepository.totalViewsByOwner(me),
                applicationRepository.countByProperty_Owner(me),
                visitRepository.countByProperty_Owner(me),
                messageRepository.unreadCount(me),
                props, recentApps, upcoming);
    }

    @Transactional(readOnly = true)
    public DashboardDtos.OwnerAnalytics analytics() {
        User me = securityUtil.requireUser();

        List<String> keys = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        YearMonth start = YearMonth.now().minusMonths(5);
        for (int i = 0; i < 6; i++) {
            YearMonth ym = start.plusMonths(i);
            keys.add(ym.toString());
            labels.add(ym.atDay(1).format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH)));
        }

        Instant since = start.atDay(1).atStartOfDay().toInstant(java.time.ZoneOffset.UTC);
        Map<String, Long> appMap = rows(applicationRepository.applicationsPerMonth(since));
        Map<String, Long> visMap = rows(visitRepository.visitsPerMonth(since));

        List<Long> applications = keys.stream().map(k -> appMap.getOrDefault(k, 0L)).toList();
        List<Long> visits = keys.stream().map(k -> visMap.getOrDefault(k, 0L)).toList();

        List<Property> mine = propertyRepository.findAllByOwner(me);
        Property top = mine.stream().max(Comparator.comparingLong(Property::getViewCount)).orElse(null);

        return new DashboardDtos.OwnerAnalytics(
                labels, applications, visits,
                propertyRepository.totalViewsByOwner(me),
                top == null ? 0 : top.getViewCount(),
                top == null ? "No listings yet" : top.getTitle(),
                favoriteRepository.countByPropertyOwner(me));
    }

    private static Map<String, Long> rows(List<Object[]> data) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : data) {
            int y = ((Number) row[0]).intValue();
            int m = ((Number) row[1]).intValue();
            map.put(YearMonth.of(y, m).toString(), ((Number) row[2]).longValue());
        }
        return map;
    }
}
