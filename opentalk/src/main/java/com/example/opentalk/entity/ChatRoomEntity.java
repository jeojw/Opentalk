package com.example.opentalk.entity;

import lombok.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@Table(name = "opentalk_room_list")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomEntity{
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

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    private List<ChatRoomHashTagEntity> roomTags = new ArrayList<>();

    @Column
    private boolean existLock;

    @Column
    private String roomPassword;

    @Builder
    public ChatRoomEntity(Long id, String roomId, String manager,
                          Integer participates, Integer limitParticipates,
                          String introduction, boolean existLock, String roomPassword,
                          List<ChatRoomHashTagEntity> roomTags){
        this.id = id;
        this.roomId = roomId;
        this.manager = manager;
        this.participates = participates;
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = existLock;
        this.roomPassword = roomPassword;
        this.roomTags = roomTags;

    }
}
