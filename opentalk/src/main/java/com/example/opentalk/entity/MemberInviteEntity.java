package com.example.opentalk.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import javax.persistence.*;

@Getter
@Entity
@Table(name = "member_invite")
@Builder
@AllArgsConstructor
public class MemberInviteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "open_talk_member_id")
    private MemberEntity member;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "invite_message_id")
    private InviteEntity message;

    public MemberInviteEntity(MemberEntity memberEntity, InviteEntity inviteEntity){
        this.member = memberEntity;
        this.message = inviteEntity;
    }
}
