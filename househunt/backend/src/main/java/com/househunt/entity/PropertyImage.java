package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "property_images",
        indexes = @Index(name = "idx_pimg_property", columnList = "property_id"))
@Getter @Setter @NoArgsConstructor
public class PropertyImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 700)
    private String url;

    @Column(length = 200)
    private String altText;

    private int sortOrder = 0;
    private boolean cover = false;
}
