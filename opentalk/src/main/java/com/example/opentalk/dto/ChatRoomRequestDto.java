package com.example.opentalk.dto;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class ChatRoomRequestDto {
    private ChatRoomDTO chatroom;
    private MemberResponseDto member;
}
