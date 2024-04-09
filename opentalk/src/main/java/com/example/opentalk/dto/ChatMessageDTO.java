package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatMessageEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageDTO {
    private ChatRoomDTO chatRoom;
    private MemberResponseDto member;
    private String message;
    private LocalDateTime timeStamp;

    public ChatMessageDTO(){}

    @Builder
    public ChatMessageDTO(ChatRoomDTO chatRoomDto, MemberResponseDto memberResponseDto,
                          String message, LocalDateTime timeStamp){
        this.chatRoom = chatRoomDto;
        this.member = memberResponseDto;
        this.message = message;
        this.timeStamp = timeStamp;
    }

    public static ChatMessageDTO toChatMessageDTO(ChatMessageEntity chatMessageEntity){
        return ChatMessageDTO.builder()
                .chatRoomDto(ChatRoomDTO.toChatRoomDTO(chatMessageEntity.getChatroom()))
                .memberResponseDto(MemberResponseDto.of(chatMessageEntity.getMember()))
                .message(chatMessageEntity.getMessage())
                .timeStamp(chatMessageEntity.getTimeStamp())
                .build();
    }
}
