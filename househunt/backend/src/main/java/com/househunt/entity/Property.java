package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "properties",
        indexes = {
                @Index(name = "idx_props_status", columnList = "status"),
                @Index(name = "idx_props_location", columnList = "location_id"),
                @Index(name = "idx_props_owner", columnList = "owner_id"),
                @Index(name = "idx_props_type_beds", columnList = "type,bedrooms")
        })
@Getter @Setter @NoArgsConstructor
public class Property {

    public enum PropertyType { APARTMENT, INDEPENDENT_HOUSE, VILLA, STUDIO, PENTHOUSE, SERVICE_APARTMENT }
    public enum Furnishing { FURNISHED, SEMI_FURNISHED, UNFURNISHED }
    public enum Status { PENDING, APPROVED, REJECTED, SUSPENDED, RENTED }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private PropertyType type = PropertyType.APARTMENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Furnishing furnishing = Furnishing.SEMI_FURNISHED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(nullable = false, length = 500)
    private String address;

    private double lat;
    private double lng;

    private int rentPerMonth;
    private int deposit;
    private int maintenancePerMonth;

    private int floorAreaSqft;
    private int bedrooms;
    private int bathrooms;
    private int balconies;

    private LocalDate availableFrom;

    private boolean petAllowed = false;
    private boolean isAvailable = true;

    private boolean featured = false;
    private boolean verified = false;
    private long viewCount = 0;

    /** short lease duration label, e.g. "11 months" */
    @Column(length = 60)
    private String leaseTerm = "11 months";

    @Column(length = 120)
    private String houseRules;

    private Instant publishedAt;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<PropertyImage> images = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id"))
    private Set<Amenity> amenities = new HashSet<>();

    public void addImage(PropertyImage image) {
        image.setProperty(this);
        images.add(image);
    }
}
