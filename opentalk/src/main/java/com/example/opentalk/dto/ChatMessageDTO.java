package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatMessageEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {
    private String roomId;
    private String message;

    public ChatMessageDTO(){}

    @Builder
    public ChatMessageDTO(String roomId, String message){
        this.roomId = roomId;
        this.message = message;
    }

    public static ChatMessageDTO toChatMessageDTO(ChatMessageEntity chatMessageEntity){
        return ChatMessageDTO.builder()
                .roomId(chatMessageEntity.getChatroom().getRoomId())
                .message(chatMessageEntity.getMessage())
                .build();
    }
}
