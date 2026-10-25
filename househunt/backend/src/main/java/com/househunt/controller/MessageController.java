package com.househunt.controller;

import com.househunt.dto.EngagementDtos;
import com.househunt.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<EngagementDtos.ThreadDto> threads() {
        return messageService.threads();
    }

    @GetMapping("/with/{peerId}")
    public List<EngagementDtos.MessageDto> conversation(@PathVariable Long peerId,
                                                        @RequestParam(defaultValue = "true") boolean markRead) {
        return messageService.with(peerId, markRead);
    }

    @PostMapping
    public EngagementDtos.MessageDto send(@Valid @RequestBody EngagementDtos.MessageRequest req) {
        return messageService.send(req);
    }
}
