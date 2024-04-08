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
    @JoinColumn(name = "chatroom_id", referencedColumnName = "room_id")
    private ChatRoomEntity chatroom;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "member_id", referencedColumnName = "member_id")
    private ChatMemberEntity member;


    public ChatRoomMemberEntity() {}

    public static ChatRoomMemberEntity toChatRoomMemberEntity(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = new ChatRoomMemberEntity();
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomMemberDTO.getChatroom());
        ChatMemberEntity chatMemberEntity = ChatMemberEntity.toChatMemberEntity(chatRoomMemberDTO.getMember());

        chatRoomMemberEntity.setChatroom(chatRoomEntity);
        chatRoomMemberEntity.setMember(chatMemberEntity);

        return chatRoomMemberEntity;
    }
}
