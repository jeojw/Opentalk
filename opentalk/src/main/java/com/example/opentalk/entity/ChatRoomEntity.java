package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatRoomDTO;
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

    @OneToMany(mappedBy = "hashtag", cascade = CascadeType.PERSIST)
    private List<ChatRoomHashtagEntity> hashtags = new ArrayList<>();

    @Column
    private boolean existLock;

    @Column
    private String roomPassword;

    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.PERSIST)
    private List<ChatRoomMemberEntity> members = new ArrayList<>();

    @Builder
    public ChatRoomEntity(Long id, String roomId, String roomName, String manager,
                          Integer limitParticipates, String introduction, boolean existLock,
                          String roomPassword){
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.manager = manager;
        this.participates = 0;
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = existLock;
        this.roomPassword = roomPassword;

    }

    public static ChatRoomEntity toChatRoomEntity(ChatRoomDTO chatRoomDTO){
        return ChatRoomEntity.builder()
                .roomName(chatRoomDTO.getRoomName())
                .roomId(chatRoomDTO.getRoomId())
                .manager(chatRoomDTO.getManager())
                .limitParticipates(chatRoomDTO.getLimitParticipates())
                .introduction(chatRoomDTO.getIntroduction())
                .existLock(chatRoomDTO.isExistLock())
                .roomPassword(chatRoomDTO.getRoomPassword())
                .build();
    }
}
