package com.househunt.controller;

import com.househunt.entity.Notification;
import com.househunt.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> mine() {
        return notificationService.mine();
    }

    @PutMapping("/read-all")
    public Map<String, Object> readAll() {
        return Map.of("updated", notificationService.markAllRead());
    }
}
