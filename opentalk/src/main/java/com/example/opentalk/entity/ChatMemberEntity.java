package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatMemberDto;
import lombok.*;

import javax.persistence.*;

@Setter
@Getter
@Entity
@Table(name = "chat_member_list")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMemberEntity {
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
    private ChatRoomRole Role;

    @Builder
    public ChatMemberEntity(String roomId, String memberId, String memberNickName, ChatRoomRole Role){
        this.roomId = roomId;
        this.memberId = memberId;
        this.memberNickName = memberNickName;
        this.Role = Role;
    }

    public static ChatMemberEntity toChatMemberEntity(ChatMemberDto chatMemberEntity){
        return ChatMemberEntity.builder()
                .roomId(chatMemberEntity.getRoomId())
                .memberId(chatMemberEntity.getMemberId())
                .memberNickName(chatMemberEntity.getMemberNickName())
                .Role(chatMemberEntity.getRole())
                .build();
    }
}
