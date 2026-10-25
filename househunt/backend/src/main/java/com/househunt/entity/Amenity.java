package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "amenities",
        indexes = @Index(name = "idx_amenities_slug", columnList = "slug", unique = true))
@Getter @Setter @NoArgsConstructor
public class Amenity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 90)
    private String name;

    @Column(nullable = false, unique = true, length = 90)
    private String slug;

    /** grouping for the filter UI: essential, lifestyle, security, outdoor */
    @Column(length = 40)
    private String category;

    /** lucide icon name used by the client */
    @Column(length = 60)
    private String icon;

    @Column(nullable = false)
    private boolean active = true;

    private int sortOrder = 0;
}
