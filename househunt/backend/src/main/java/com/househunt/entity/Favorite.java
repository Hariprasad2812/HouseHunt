package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "favorites", uniqueConstraints = {
        @UniqueConstraint(name = "uk_fav_user_prop", columnNames = {"user_id", "property_id"})
}, indexes = {
        @Index(name = "idx_fav_user", columnList = "user_id"),
        @Index(name = "idx_fav_prop", columnList = "property_id")
})
@Getter @Setter @NoArgsConstructor
public class Favorite {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();
}
