package com.example.opentalk.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter
@Setter
@Table(name = "chatroom_hashtag")
public class ChatRoomHashtagEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "opentalk_room_list_id")
    private ChatRoomEntity chatroom;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "tag_tag_id")
    private HashTagEntity hashtag;

    public ChatRoomHashtagEntity() {}
}
