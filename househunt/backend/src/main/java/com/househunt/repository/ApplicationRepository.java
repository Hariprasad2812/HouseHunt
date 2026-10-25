package com.househunt.repository;

import com.househunt.entity.Application;
import com.househunt.entity.Property;
import com.househunt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findAllByUserOrderByCreatedAtDesc(User user);
    List<Application> findAllByProperty_OwnerOrderByCreatedAtDesc(User owner);
    long countByUser(User user);
    long countByProperty_Owner(User owner);
    @Query("select a from Application a where a.property.owner = :owner and a.status = 'PENDING' order by a.createdAt desc")
    List<Application> findPendingForOwner(@Param("owner") User owner);
    Optional<Application> findFirstByUserAndProperty(User user, Property property);

    @Query("select function('year', a.createdAt), function('month', a.createdAt), count(a) from Application a where a.createdAt >= :since group by function('year', a.createdAt), function('month', a.createdAt) order by 1, 2")
    List<Object[]> applicationsPerMonth(java.time.Instant since);
    long deleteByProperty(com.househunt.entity.Property property);
    long deleteByUser(com.househunt.entity.User user);
}
