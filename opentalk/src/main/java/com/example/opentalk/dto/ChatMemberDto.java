package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatMemberEntity;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class ChatMemberDto {
    private String roomId;
    private String memberId;
    private String memberNickName;
    private String role;

    public ChatMemberDto() {
    }

    @Builder
    public ChatMemberDto(String roomId, String memberId, String memberNickName, String role){
        this.roomId = roomId;
        this.memberId = memberId;
        this.memberNickName = memberNickName;
        this.role = role;
    }

    public static ChatMemberDto toChatMemberDto(ChatMemberEntity chatMemberEntity){
        return ChatMemberDto.builder()
                .roomId(chatMemberEntity.getRoomId())
                .memberId(chatMemberEntity.getMemberId())
                .memberNickName(chatMemberEntity.getMemberNickName())
                .role(chatMemberEntity.getRole())
                .build();
    }
}