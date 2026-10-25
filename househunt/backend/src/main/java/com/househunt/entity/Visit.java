package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits",
        indexes = {
                @Index(name = "idx_visit_user", columnList = "user_id"),
                @Index(name = "idx_visit_property", columnList = "property_id")
        })
@Getter @Setter @NoArgsConstructor
public class Visit {

    public enum Status { REQUESTED, CONFIRMED, COMPLETED, CANCELLED }
    public enum Mode { IN_PERSON, VIDEO_CALL }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Mode mode = Mode.IN_PERSON;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.REQUESTED;

    @Column(length = 1500)
    private String note;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();
}
