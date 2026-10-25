package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.NotificationRepository;
import com.househunt.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;

    /** keep enum type string safe across internal callers */
    public static Notification.Type safeType(String name) {
        try { return Notification.Type.valueOf(name); } catch (Exception e) { return Notification.Type.SYSTEM; }
    }

    @Transactional
    public void notify(User to, Notification.Type type, String title, String body, String link) {
        if (to == null || !to.isActive()) return;
        Notification n = new Notification();
        n.setUser(to);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setLink(link);
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notification> mine() {
        User me = securityUtil.requireUser();
        return notificationRepository.findTop30ByUserOrderByCreatedAtDesc(me);
    }

    @Transactional(readOnly = true)
    public long unreadCount(User u) {
        return notificationRepository.countByUserAndReadFalse(u);
    }

    @Transactional
    public long markAllRead() {
        User me = securityUtil.requireUser();
        List<Notification> list = notificationRepository.findTop30ByUserOrderByCreatedAtDesc(me);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        return list.size();
    }
}
