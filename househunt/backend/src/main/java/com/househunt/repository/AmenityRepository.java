package com.househunt.repository;

import com.househunt.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    List<Amenity> findAllByOrderByCategoryAscSortOrderAsc();
    List<Amenity> findByIdIn(Set<Long> ids);
}
