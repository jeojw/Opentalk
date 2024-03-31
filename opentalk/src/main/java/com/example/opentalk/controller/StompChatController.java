package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatMessageDTO;
import groovy.util.logging.Slf4j;
import lombok.RequiredArgsConstructor;
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
        template.convertAndSend("/sub/chat/" + chatMessage.getRoomId(), chatMessage);
    }

    @EventListener(SessionConnectedEvent.class)
    public void onConnect(SessionConnectedEvent event){
        String sessionId = event.getMessage().getHeaders().get("simpleSessionId").toString();
        SESSION_IDS.add(sessionId);

    }

    @EventListener(SessionConnectedEvent.class)
    public void onDisconnect(SessionDisconnectEvent event){
        String sessionId = event.getSessionId();
        SESSION_IDS.remove(sessionId);
    }
}
