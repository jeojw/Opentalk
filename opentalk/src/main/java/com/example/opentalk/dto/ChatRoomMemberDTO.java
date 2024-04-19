package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomMemberEntity;
import com.example.opentalk.entity.ChatRoomRole;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class ChatRoomMemberDTO {
    private ChatRoomDTO chatroom;
    private AuthDto.ResponseDto member;
    private ChatRoomRole role;

    public ChatRoomMemberDTO() {}

    @Builder
    public ChatRoomMemberDTO(ChatRoomDTO chatRoom, AuthDto.ResponseDto member, ChatRoomRole role){
        this.chatroom = chatRoom;
        this.member = member;
        this.role = role;
    }

    public static ChatRoomMemberDTO toChatRoomMemberDTO(ChatRoomMemberEntity chatRoomMemberEntity){
        return ChatRoomMemberDTO.builder()
                .chatRoom(ChatRoomDTO.toChatRoomDTO(chatRoomMemberEntity.getChatroom()))
                .member(AuthDto.ResponseDto.toResponse(chatRoomMemberEntity.getMember()))
                .role(chatRoomMemberEntity.getRole())
                .build();
    }
}
