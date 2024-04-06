package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatMessageEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDTO {
    private String roomId;
    private String writer;
    private String message;

    @Builder
    public ChatMessageDTO(String roomId, String writer, String message){
        this.roomId = roomId;
        this.writer = writer;
        this.message = message;
    }

    public static ChatMessageDTO toChatMessageDTO(ChatMessageEntity chatMessageEntity){
        return ChatMessageDTO.builder()
                .roomId(chatMessageEntity.getRoomId())
                .writer(chatMessageEntity.getWriter())
                .message(chatMessageEntity.getMessage())
                .build();
    }
}
