package com.househunt.repository;

import com.househunt.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findBySlug(String slug);
    List<Location> findAllByOrderBySortOrderAsc();
    long countByNameContainingIgnoreCase(String q);
}
