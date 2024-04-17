package com.example.opentalk.entity;

import com.example.opentalk.dto.InviteDto;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invite_message")
@Getter
@NoArgsConstructor
public class InviteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "inviter", nullable = false)
    private String inviter;

    @Column(name = "invited_member", nullable = false)
    private String invitedMember;

    @Column(name = "message")
    private String message;


    @OneToMany(mappedBy = "message", cascade = CascadeType.PERSIST)
    private List<MemberInviteEntity> memberInviteEntity = new ArrayList<>();

    @Builder
    public InviteEntity(String roomId, String roomName, String message, String inviter, String invitedMember){
        this.roomId = roomId;
        this.roomName = roomName;
        this.message = message;
        this.inviter = inviter;
        this.invitedMember = invitedMember;
    }

    public static InviteEntity toInviteEntity(InviteDto inviteDto){
        return InviteEntity.builder()
                .roomId(inviteDto.getRoomId())
                .roomName(inviteDto.getRoomName())
                .message(inviteDto.getMessage())
                .inviter(inviteDto.getInviter())
                .invitedMember(inviteDto.getInvitedMember())
                .build();
    }
}
