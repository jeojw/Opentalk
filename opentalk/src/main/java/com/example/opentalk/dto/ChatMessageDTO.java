package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatMessageEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageDTO {
    private ChatRoomDTO chatRoom;
    private AuthDto.ResponseDto member;
    private String message;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd-HH:mm", timezone = "Asia/Seoul")
    private LocalDateTime timeStamp;

    public ChatMessageDTO(){}

    @Builder
    public ChatMessageDTO(ChatRoomDTO chatRoomDto, AuthDto.ResponseDto memberResponseDto,
                          String message, LocalDateTime timeStamp){
        this.chatRoom = chatRoomDto;
        this.member = memberResponseDto;
        this.message = message;
        this.timeStamp = timeStamp;
    }

    public static ChatMessageDTO toChatMessageDTO(ChatMessageEntity chatMessageEntity){
        return ChatMessageDTO.builder()
                .chatRoomDto(ChatRoomDTO.toChatRoomDTO(chatMessageEntity.getChatroom()))
                .memberResponseDto(AuthDto.ResponseDto.toResponse(chatMessageEntity.getMember()))
                .message(chatMessageEntity.getMessage())
                .timeStamp(chatMessageEntity.getTimeStamp())
                .build();
    }
}
