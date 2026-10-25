package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "locations",
        indexes = @Index(name = "idx_locations_slug", columnList = "slug", unique = true))
@Getter @Setter @NoArgsConstructor
public class Location {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 90)
    private String name;

    @Column(nullable = false, unique = true, length = 90)
    private String slug;

    /** e.g. "East Bengaluru", "Old Bengaluru", "IT Corridor" */
    @Column(length = 90)
    private String region;

    @Column(length = 2000)
    private String description;

    @Column(length = 500)
    private String imageUrl;

    private double lat;

    private double lng;

    /** indicative average monthly rent used by the search helper */
    private int avgRentMin;
    private int avgRentMax;

    private int sortOrder = 0;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();
}
