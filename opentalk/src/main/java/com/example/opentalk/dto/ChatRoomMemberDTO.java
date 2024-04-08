package com.example.opentalk.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class ChatRoomMemberDTO {
    private ChatRoomDTO chatroom;
    private MemberRequestDto member;
}
