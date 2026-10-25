package com.househunt.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "messages",
        indexes = {
                @Index(name = "idx_msg_sender", columnList = "sender_id"),
                @Index(name = "idx_msg_recipient", columnList = "recipient_id"),
                @Index(name = "idx_msg_thread", columnList = "sender_id,recipient_id")
        })
@Getter @Setter @NoArgsConstructor
public class Message {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

   @Column(nullable = false, length = 3000)
private String body;

@Column(name = "is_read", nullable = false)
private boolean read = false;

@Column(updatable = false)
private Instant createdAt = Instant.now();
}