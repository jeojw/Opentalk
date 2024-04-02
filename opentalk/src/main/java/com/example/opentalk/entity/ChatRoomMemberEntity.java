package com.example.opentalk.entity;

import javax.persistence.*;

@Entity
public class ChatRoomMemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chatroom_id")
    private ChatRoomEntity chatroom;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private MemberEntity member;
}
