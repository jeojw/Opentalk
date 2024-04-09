package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatRoomMemberDTO;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "chatroom_member")
public class ChatRoomMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "opentalk_room_list_id")
    private ChatRoomEntity chatroom;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "open_talk_member_id")
    private MemberEntity member;

    @Column(name = "role")
    private String role;

    public ChatRoomMemberEntity() {}

    @Builder
    public ChatRoomMemberEntity(ChatRoomEntity chatroom, MemberEntity member) {
        this.chatroom = chatroom;
        this.member = member;
        if (chatroom.getRoomManager().equals(member.getMemberNickName())){
            this.role = "MANAGER";
        }
        else{
            this.role = "PARTICIPATES";
        }

    }

    public static ChatRoomMemberEntity toChatRoomMemberEntity(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomMemberDTO.getChatroom());
        MemberEntity chatMemberEntity = MemberEntity.toMemberEntity(chatRoomMemberDTO.getMember());

        return ChatRoomMemberEntity.builder()
                .chatroom(chatRoomEntity)
                .member(chatMemberEntity)
                .build();
    }
}
