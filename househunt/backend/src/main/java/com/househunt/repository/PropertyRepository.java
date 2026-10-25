package com.househunt.repository;

import com.househunt.entity.Property;
import com.househunt.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    List<Property> findTop8ByStatusAndIsAvailableTrueOrderByFeaturedDescPublishedAtDesc(Property.Status status);

    @Query("select p from Property p where p.owner = :owner order by p.updatedAt desc")
    List<Property> findAllByOwner(@Param("owner") User owner);

    long countByStatus(Property.Status status);
    long countByOwner(User owner);
    long countByOwnerAndStatus(User owner, Property.Status status);

    @Query("select coalesce(sum(p.viewCount), 0) from Property p where p.owner = :owner")
    long totalViewsByOwner(@Param("owner") User owner);

    @Query("select coalesce(sum(p.viewCount),0) from Property p")
    long totalViewsAll();

    @Query("select coalesce(sum(p.viewCount),0) from Property p where p.owner = :owner and p.status = 'APPROVED'")
    long activeViewsByOwner(@Param("owner") User owner);

    long countByLocationAndStatus(com.househunt.entity.Location location, Property.Status status);

    @Query("select p.location.id, count(p) from Property p where p.status = 'APPROVED' and p.isAvailable = true group by p.location.id")
    List<Object[]> approvedCountsByLocation();

    @Query("select p.location.id, count(p) from Property p where p.status = 'APPROVED' group by p.location.id")
    List<Object[]> allApprovedCountsByLocation();

    @Query("select function('year', p.publishedAt), function('month', p.publishedAt), count(p) from Property p where p.publishedAt >= :since group by function('year', p.publishedAt), function('month', p.publishedAt) order by 1, 2")
    List<Object[]> listingsPerMonth(java.time.Instant since);

}
