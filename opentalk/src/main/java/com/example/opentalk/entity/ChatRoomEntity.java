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
public class ChatRoomEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "room_id", nullable = false)
    private String roomId;

    @Column(name = "limit_participates", nullable = false)
    private Integer limitParticipates;

    @Column(name = "introduction")
    private String introduction;

    @Column(name = "exist_lock")
    private boolean existLock;

    @Column(name = "room_password")
    private String roomPassword;

    @Column(name = "room_manager")
    private String roomManager;

    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.PERSIST)
    private List<ChatRoomHashtagEntity> hashtags = new ArrayList<>();

    @OneToMany(mappedBy = "chatroom", cascade = CascadeType.PERSIST)
    private List<ChatRoomMemberEntity> members = new ArrayList<>();

    @OneToMany(mappedBy="chatroom", cascade = CascadeType.PERSIST)
    private List<ChatMessageEntity> messages = new ArrayList<>();

    public ChatRoomEntity() {}

    @Builder
    public ChatRoomEntity(String roomId, String roomName, Integer limitParticipates,
                          String introduction, boolean existLock, String roomManager,
                          String roomPassword){
        this.roomId = roomId;
        this.roomName = roomName;
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = existLock;
        this.roomPassword = roomPassword;
        this.roomManager = roomManager;
    }

    public static ChatRoomEntity toChatRoomEntity(ChatRoomDTO chatRoomDTO){
        return ChatRoomEntity.builder()
                .roomName(chatRoomDTO.getRoomName())
                .roomId(chatRoomDTO.getRoomId())
                .introduction(chatRoomDTO.getIntroduction())
                .existLock(chatRoomDTO.isExistLock())
                .roomPassword(chatRoomDTO.getRoomPassword())
                .roomManager(chatRoomDTO.getRoomManager())
                .limitParticipates(chatRoomDTO.getLimitParticipates())
                .build();
    }
}
