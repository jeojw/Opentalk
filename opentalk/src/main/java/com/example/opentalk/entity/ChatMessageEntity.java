package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatMessageDTO;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Getter
@Entity
@Table(name = "chat_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(name = "writer", nullable = false)
    private String writer;

    @Column(name = "message", nullable = false)
    private String message;

    @Builder
    public ChatMessageEntity (String roomId, String writer, String message){
        this.roomId = roomId;
        this.writer = writer;
        this.message = message;
    }

    public static ChatMessageEntity toChatMessageEntity(ChatMessageDTO chatMessageDTO){
        return ChatMessageEntity.builder()
                .roomId(chatMessageDTO.getRoomId())
                .writer(chatMessageDTO.getWriter())
                .message(chatMessageDTO.getMessage())
                .build();
    }
}
