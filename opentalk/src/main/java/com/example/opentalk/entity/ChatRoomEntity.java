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

    @Column(unique = true)
    private String roomId;

    @Column(nullable = false)
    private String manager;

    @Column(nullable = false)
    private Integer participates;

    @Column(nullable = false)
    private Integer limitParticipates;

    @Column
    private String introduction;

    @ManyToMany
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

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name= " member_id")
    private MemberEntity member;

    @Builder
    public ChatRoomEntity(Long id, String roomId, String manager,
                          Integer participates, Integer limitParticipates,
                          String introduction, boolean existLock, String roomPassword,
                          List<HashTagEntity> roomTags){
        this.id = id;
        this.roomId = roomId;
        this.manager = manager;
        this.participates = participates;
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = existLock;
        this.roomPassword = roomPassword;
        this.hashtags = roomTags;

    }

    public static ChatRoomEntity toChatRoomEntity(ChatRoomDTO chatRoomDTO){
        List<HashTagEntity> hashTagEntities = new ArrayList<>();
        for (HashTagDTO tag : chatRoomDTO.getRoomTags()){
            hashTagEntities.add(HashTagEntity.builder()
                                                .name(tag.getTagName())
                                                .build());
        }
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.builder()
                .roomId(chatRoomDTO.getRoomId())
                .manager(chatRoomDTO.getManager())
                .participates(chatRoomDTO.getParticipates())
                .limitParticipates(chatRoomDTO.getLimitParticipates())
                .introduction(chatRoomDTO.getIntroduction())
                .existLock(chatRoomDTO.isExistLock())
                .roomPassword(chatRoomDTO.getRoomPassword())
                .roomTags(hashTagEntities)
                .build();
        return chatRoomEntity;
    }
}
