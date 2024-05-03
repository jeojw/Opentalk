package com.example.opentalk.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.UUID;

@Getter
@Data
public class InviteDto {
    private String inviteId = UUID.randomUUID().toString();
    private String roomId;
    private String roomName;
    private String inviter;
    private String message;
    private String invitedMember;

    InviteDto() {}

    @Builder
    public InviteDto(String inviteId, String roomId, String roomName, String inviter, String message, String invitedMember){
        this.inviteId = inviteId;
        this.roomId = roomId;
        this.roomName = roomName;
        this.inviter = inviter;
        this.message = message;
        this.invitedMember = invitedMember;
    }
}
