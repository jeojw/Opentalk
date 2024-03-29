package com.example.opentalk;

import groovy.util.logging.Slf4j;
import lombok.SneakyThrows;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import javax.security.auth.message.AuthException;

@Slf4j
@Component
public class WebSocketInterceptor implements ChannelInterceptor {
    @SneakyThrows
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (accessor.getCommand() == StompCommand.CONNECT){
            String authToken = accessor.getFirstNativeHeader("auth-token");

            if (!"spring-chat-auth-token".equals(authToken)){
                throw new AuthException("fail");
            }
        }
        return message;
    }
}
