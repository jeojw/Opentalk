package com.example.opentalk.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
public class InviteDto {
    private String roomId;
    private String roomName;
    private String inviter;
    private String message;
    private String invitedMember;

    public InviteDto(String roomId, String roomName, String inviter, String message, String invitedMember){
        this.roomId = roomId;
        this.roomName = roomName;
        this.inviter = inviter;
        this.message = message;
        this.invitedMember = invitedMember;
    }
}
