package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.dto.PropertyDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.FavoriteRepository;
import com.househunt.repository.PropertyRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final SecurityUtil securityUtil;

    @Transactional
    public EngagementDtos.FavoriteAction toggle(Long propertyId) {
        User me = securityUtil.requireUser();
        Property p = propertyRepository.findById(propertyId)
                .orElseThrow(() -> ApiException.notFound("Property not found"));
        boolean adding = !favoriteRepository.existsByUserAndProperty(me, p);
        if (adding) {
            Favorite f = new Favorite();
            f.setUser(me);
            f.setProperty(p);
            favoriteRepository.save(f);
        } else {
            favoriteRepository.findByUserAndProperty(me, p).ifPresent(favoriteRepository::delete);
        }
        return new EngagementDtos.FavoriteAction(adding);
    }

    @Transactional(readOnly = true)
    public List<PropertyDtos.PropertyCard> mine() {
        User me = securityUtil.requireUser();
        return favoriteRepository.findAllByUserOrderByCreatedAtDesc(me).stream()
                .map(Favorite::getProperty)
                .map(p -> Mappers.card(p, true))
                .toList();
    }
}
