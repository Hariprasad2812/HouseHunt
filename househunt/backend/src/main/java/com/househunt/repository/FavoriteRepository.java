package com.househunt.repository;

import com.househunt.entity.Favorite;
import com.househunt.entity.Property;
import com.househunt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findByUserAndProperty(User user, Property property);
    boolean existsByUserAndProperty(User user, Property property);
    List<Favorite> findAllByUserOrderByCreatedAtDesc(User user);
    long countByProperty(Property property);
    @Query("select f.property from Favorite f where f.user = :user order by f.createdAt desc")
    List<Property> findPropertiesByUser(@Param("user") User user);
    long countByUser(User user);
    @Query("select count(f) from Favorite f where f.property.owner = :owner")
    long countByPropertyOwner(@Param("owner") User owner);
    long deleteByProperty(com.househunt.entity.Property property);
    long deleteByUser(com.househunt.entity.User user);
}
