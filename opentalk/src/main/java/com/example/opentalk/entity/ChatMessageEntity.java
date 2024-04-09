package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatMessageDTO;
import lombok.Builder;
import lombok.Getter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "chat_log")
public class ChatMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message", nullable = false)
    private String message;

    @Column(name = "time_stamp", nullable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime timeStamp;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "opentalk_room_list_id")
    private ChatRoomEntity chatroom;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "open_talk_member_id")
    private MemberEntity member;

    @Builder
    public ChatMessageEntity (String message){
        this.message = message;
    }

    public static ChatMessageEntity toChatMessageEntity(ChatMessageDTO chatMessageDTO){
        return ChatMessageEntity.builder()
                .message(chatMessageDTO.getMessage())
                .build();
    }
}
