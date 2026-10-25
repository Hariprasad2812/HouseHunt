package com.househunt.repository;

import com.househunt.entity.Notification;
import com.househunt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop30ByUserOrderByCreatedAtDesc(User user);
    long countByUserAndReadFalse(User user);
    long deleteByUser(com.househunt.entity.User user);
}
