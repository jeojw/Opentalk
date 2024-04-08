package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatMemberDto;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "chat_member_list")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMemberEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "room_id")
    private String roomId;
    @Column(name = "member_id")
    private String memberId;
    @Column(name = "member_nick_name")
    private String memberNickName;
    @Column(name = "role")
    private String role;
    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<ChatRoomMemberEntity> chatRooms = new ArrayList<>();



    @Builder
    public ChatMemberEntity(String roomId, String memberId, String memberNickName, String role){
        this.roomId = roomId;
        this.memberId = memberId;
        this.memberNickName = memberNickName;
        this.role = role;
    }

    public static ChatMemberEntity toChatMemberEntity(ChatMemberDto chatMemberdto){
        return ChatMemberEntity.builder()
                .roomId(chatMemberdto.getRoomId())
                .memberId(chatMemberdto.getMemberId())
                .memberNickName(chatMemberdto.getMemberNickName())
                .role(chatMemberdto.getRole())
                .build();
    }
}
