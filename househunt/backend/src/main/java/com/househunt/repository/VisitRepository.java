package com.househunt.repository;

import com.househunt.entity.Visit;
import com.househunt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findAllByUserOrderByScheduledAtDesc(User user);
    List<Visit> findAllByProperty_OwnerOrderByScheduledAtDesc(User owner);
    long countByUser(User user);
    long countByProperty_Owner(User owner);
    @Query("select v from Visit v where v.property.owner = :owner and v.status = 'REQUESTED' order by v.createdAt desc")
    List<Visit> findRequestsForOwner(@Param("owner") User owner);

    @Query("select function('year', v.createdAt), function('month', v.createdAt), count(v) from Visit v where v.createdAt >= :since group by function('year', v.createdAt), function('month', v.createdAt) order by 1, 2")
    List<Object[]> visitsPerMonth(java.time.Instant since);
    long deleteByProperty(com.househunt.entity.Property property);
    long deleteByUser(com.househunt.entity.User user);
}
