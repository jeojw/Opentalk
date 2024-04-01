package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@RestController
@RequiredArgsConstructor
public class StompChatController {
    private final SimpMessagingTemplate template;
    private static final Set<String> SESSION_IDS = new HashSet<>();

    @MessageMapping("/chat")
    public void publishChat(ChatMessageDTO chatMessage){
        log.info("publishChat : {}", chatMessage);
        template.convertAndSend("/sub/chat/" + chatMessage.getRoomId(), chatMessage);
    }

    @EventListener(SessionConnectedEvent.class)
    public void onConnect(SessionConnectedEvent event){
        String sessionId = event.getMessage().getHeaders().get("simpSessionId").toString();
        SESSION_IDS.add(sessionId);
        log.info("[connect] connections : {}", SESSION_IDS.size());
    }

    @EventListener(SessionConnectedEvent.class)
    public void onDisconnect(SessionDisconnectEvent event){
        String sessionId = event.getSessionId();
        SESSION_IDS.remove(sessionId);
        log.info("[disconnect] connections : {}", SESSION_IDS.size());
    }
}
