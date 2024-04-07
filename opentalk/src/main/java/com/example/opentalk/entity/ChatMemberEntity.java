package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatMemberDto;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
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
    @Column
    private String roomId;
    @Column
    private String memberId;
    @Column
    private String memberNickName;
    @Column
    private String role;
    @ManyToMany(mappedBy = "members", cascade = CascadeType.PERSIST)
    private List<ChatRoomEntity> chatRooms;



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
