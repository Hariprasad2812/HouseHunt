package com.househunt.repository;

import com.househunt.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByProperty_IdOrderByCreatedAtDesc(Long propertyId);
    List<Review> findAllByApprovedTrueAndProperty_IdOrderByCreatedAtDesc(Long propertyId);
    long countByProperty_Id(Long propertyId);
    @Query("select coalesce(avg(r.rating),0) from Review r where r.property.id = :pid and r.approved = true")
    double avgForProperty(@Param("pid") Long pid);
    long countByApproved(boolean approved);
    long deleteByProperty(com.househunt.entity.Property property);
    long deleteByAuthor(com.househunt.entity.User author);
}
