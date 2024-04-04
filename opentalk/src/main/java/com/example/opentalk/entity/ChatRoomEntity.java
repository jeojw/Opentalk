package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.dto.MemberDTO;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@Table(name = "opentalk_room_list")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String manager;

    @Column(nullable = false)
    private Integer participates;

    @Column(nullable = false)
    private Integer limitParticipates;

    @Column
    private String introduction;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinTable(
            name = "chatroom_hashtag",
            joinColumns = @JoinColumn(name = "chatroom_id", referencedColumnName = "roomId"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id", referencedColumnName = "tag_id")
    )
    private List<HashTagEntity> hashtags = new ArrayList<>();

    @Column
    private boolean existLock;

    @Column
    private String roomPassword;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinTable(
            name = "chatroom_member",
            joinColumns = @JoinColumn(name = "chatroom_id"),
            inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    private List<MemberEntity> members;

    @Builder
    public ChatRoomEntity(Long id, String roomId, String roomName, String manager, Integer limitParticipates,
                          String introduction, boolean existLock, String roomPassword,
                          List<MemberEntity> members, List<HashTagEntity> roomTags){
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.manager = manager;
        this.participates = members.size();
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = existLock;
        this.roomPassword = roomPassword;
        this.members = members;
        this.hashtags = roomTags;

    }

    public static ChatRoomEntity toChatRoomEntity(ChatRoomDTO chatRoomDTO){
        List<HashTagEntity> hashTagEntities = new ArrayList<>();
        List<MemberEntity> memberEntities = new ArrayList<>();
        for (HashTagDTO tag : chatRoomDTO.getRoomTags()){
            hashTagEntities.add(HashTagEntity.builder()
                    .name(tag.getTagName())
                    .build());
        }
        for (MemberDTO m : chatRoomDTO.getMembers()){
            memberEntities.add(MemberEntity.builder()
                    .memberId(m.getMemberId())
                    .memberPassword(m.getMemberPassword())
                    .memberName(m.getMemberName())
                    .memberNickName(m.getMemberNickName())
                    .memberEmail(m.getMemberEmail())
                    .authority(m.getAuthority())
                    .build());
        }
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.builder()
                .roomName(chatRoomDTO.getRoomName())
                .roomId(chatRoomDTO.getRoomId())
                .manager(chatRoomDTO.getManager())
                .limitParticipates(chatRoomDTO.getLimitParticipates())
                .introduction(chatRoomDTO.getIntroduction())
                .existLock(chatRoomDTO.isExistLock())
                .roomPassword(chatRoomDTO.getRoomPassword())
                .roomTags(hashTagEntities)
                .members(memberEntities)
                .build();
        return chatRoomEntity;
    }
}
