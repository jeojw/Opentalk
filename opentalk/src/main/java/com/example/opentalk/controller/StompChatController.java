package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatMessageDTO;
import com.example.opentalk.dto.SystemMessageDto;
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
        template.convertAndSend("/sub/chat/" + chatMessage.getChatRoom().getRoomId(), chatMessage);
    }

    @MessageMapping("/chat/enter")
    public void enterRoom(ChatMessageDTO chatMessage){
        chatMessage.setMessage(chatMessage.getMessage());
        template.convertAndSend("/sub/chat/" + chatMessage.getChatRoom().getRoomId(), chatMessage);
    }

    @MessageMapping("/chat/exit")
    public void exitRoom(ChatMessageDTO chatMessage){
        chatMessage.setMessage(chatMessage.getMessage());
        log.info("exitChat : {}", chatMessage);
        template.convertAndSend("/sub/chat/" + chatMessage.getChatRoom().getRoomId(), chatMessage);
    }

    @MessageMapping("/chat/changeNickName")
    public void changeName(SystemMessageDto message){
        message.setMessage(message.getMessage());
        template.convertAndSend("/sub/chat/changeNickName", message);
    }

    @MessageMapping("/chat/createRoom")
    public void createRoom(SystemMessageDto message){
        message.setMessage(message.getMessage());
        template.convertAndSend("/sub/chat/createRoom", message);
    }

    @MessageMapping("/chat/deleteRoom")
    public void deleteRoom(SystemMessageDto message){
        message.setMessage(message.getMessage());
        template.convertAndSend("/sub/chat/deleteRoom", message);
    }

    @MessageMapping("/chat/manager")
    public void assignManager(ChatMessageDTO chatMessage){
        chatMessage.setMessage(chatMessage.getMessage());
        log.info("assignManagerChat : {}", chatMessage);
        template.convertAndSend("/sub/chat/" + chatMessage.getChatRoom().getRoomId(), chatMessage);
    }

    @MessageMapping("/chat/forcedExit")
    public void forcedExitRoom(ChatMessageDTO chatMessage){
        log.info("forcedExitChat : {}", chatMessage);
        chatMessage.setMessage(chatMessage.getMessage());
        template.convertAndSend("/sub/chat/" + chatMessage.getChatRoom().getRoomId(), chatMessage);
    }

    @EventListener(SessionConnectedEvent.class)
    public void onConnect(SessionConnectedEvent event){
        String sessionId = event.getMessage().getHeaders().get("simpSessionId").toString();
        SESSION_IDS.add(sessionId);
        log.info("[connect] connections : {}", SESSION_IDS.size());
    }

    @EventListener(SessionDisconnectEvent.class)
    public void onDisconnect(SessionDisconnectEvent event){
        String sessionId = event.getSessionId();
        SESSION_IDS.remove(sessionId);
        log.info("[disconnect] connections : {}", SESSION_IDS.size());
    }
}
