package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications",
        indexes = @Index(name = "idx_notif_user", columnList = "user_id"))
@Getter @Setter @NoArgsConstructor
public class Notification {

    public enum Type { APPLICATION, VISIT, MESSAGE, LISTING, SYSTEM }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type = Type.SYSTEM;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1200)
    private String body;

    @Column(length = 500)
    private String link;

  @Column(name = "is_read", nullable = false)
private boolean read = false;

    @Column(updatable = false)
    private Instant createdAt = Instant.now();
}
