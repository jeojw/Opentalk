package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatRoomMemberDTO;
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

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "opentalk_room_list_id")
    private ChatRoomEntity chatroom;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "open_talk_member_id")
    private MemberEntity member;

    @Column(name = "role")
    private String role;


    public ChatRoomMemberEntity() {}

    public static ChatRoomMemberEntity toChatRoomMemberEntity(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = new ChatRoomMemberEntity();
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomMemberDTO.getChatroom());
        MemberEntity chatMemberEntity = MemberEntity.toMemberEntity(chatRoomMemberDTO.getMember());

        chatRoomMemberEntity.setChatroom(chatRoomEntity);
        chatRoomMemberEntity.setMember(chatMemberEntity);

        return chatRoomMemberEntity;
    }
}
