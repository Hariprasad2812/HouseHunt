package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "reviews",
        indexes = {
                @Index(name = "idx_rev_property", columnList = "property_id"),
                @Index(name = "idx_rev_author", columnList = "author_id")
        })
@Getter @Setter @NoArgsConstructor
public class Review {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private int rating = 5;

    @Column(length = 2000)
    private String comment;

    @Column(nullable = false)
    private boolean approved = false;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();
}
