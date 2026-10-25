package com.househunt.service;

import com.househunt.dto.EngagementDtos;
import com.househunt.entity.*;
import com.househunt.exception.ApiException;
import com.househunt.repository.MessageRepository;
import com.househunt.repository.PropertyRepository;
import com.househunt.repository.UserRepository;
import com.househunt.security.SecurityUtil;
import com.househunt.util.Mappers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final NotificationService notificationService;
    private final SecurityUtil securityUtil;

    @Transactional
    public EngagementDtos.MessageDto send(EngagementDtos.MessageRequest req) {
        User me = securityUtil.requireUser();
        User other = userRepository.findById(req.recipientId())
                .orElseThrow(() -> ApiException.notFound("Recipient not found"));
        if (other.getId().equals(me.getId())) throw ApiException.badRequest("You can't message yourself.");
        Property p = req.propertyId() == null ? null
                : propertyRepository.findById(req.propertyId()).orElse(null);
        Message m = new Message();
        m.setSender(me);
        m.setRecipient(other);
        m.setProperty(p);
        m.setBody(req.body().trim());
        messageRepository.save(m);
        notificationService.notify(other, Notification.Type.MESSAGE,
                "New message from " + me.getFullName(),
                req.body().length() > 120 ? req.body().substring(0, 120) + "…" : req.body(),
                "/messages/" + me.getId());
        return Mappers.message(m);
    }

    @Transactional
    public List<EngagementDtos.ThreadDto> threads() {
        User me = securityUtil.requireUser();
        List<User> peers = messageRepository.sendersTo(me);
        Map<Long, EngagementDtos.ThreadDto> out = new LinkedHashMap<>();
        for (User peer : peers) {
            long unread = messageRepository.findAllBySenderAndRecipientAndReadFalse(peer, me).size();
            List<Message> conv = conversation(me, peer);
            if (conv.isEmpty()) continue;
            Message last = conv.get(conv.size() - 1);
            out.put(peer.getId(), new EngagementDtos.ThreadDto(peer.getId(), peer.getFullName(), peer.getAvatarUrl(),
                    last.getBody(), last.getCreatedAt(), unread));
        }
        // also threads where I am the sender but peer never wrote back
        for (User peer : messageRepository.recipientsFrom(me)) {
            if (!out.containsKey(peer.getId())) {
                List<Message> conv = conversation(me, peer);
                if (!conv.isEmpty()) {
                    Message last = conv.get(conv.size() - 1);
                    out.put(peer.getId(), new EngagementDtos.ThreadDto(peer.getId(), peer.getFullName(), peer.getAvatarUrl(),
                            last.getBody(), last.getCreatedAt(), 0));
                }
            }
        }
        List<EngagementDtos.ThreadDto> list = new ArrayList<>(out.values());
        list.sort((a, b) -> b.lastAt().compareTo(a.lastAt()));
        return list;
    }

    private List<Message> conversation(User a, User b) {
        return messageRepository.conversation(a, b);
    }

    @Transactional
    public List<EngagementDtos.MessageDto> with(Long peerId, boolean markRead) {
        User me = securityUtil.requireUser();
        User peer = userRepository.findById(peerId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        List<Message> msgs = conversation(me, peer);
        if (markRead) {
            for (Message m : msgs) {
                if (m.getRecipient().getId().equals(me.getId()) && !m.isRead()) {
                    m.setRead(true);
                    messageRepository.save(m);
                }
            }
        }
        return msgs.stream().map(Mappers::message).toList();
    }

    @Transactional(readOnly = true)
    public long unread() {
        return messageRepository.unreadCount(securityUtil.requireUser());
    }
}
