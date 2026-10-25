package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "applications",
        indexes = {
                @Index(name = "idx_app_user", columnList = "user_id"),
                @Index(name = "idx_app_property", columnList = "property_id"),
                @Index(name = "idx_app_status", columnList = "status")
        })
@Getter @Setter @NoArgsConstructor
public class Application {

    public enum Status { PENDING, SHORTLISTED, APPROVED, REJECTED, WITHDRAWN }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false, length = 2000)
    private String message = "";

    /** expected move-in date */
    private java.time.LocalDate moveInDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();
}
