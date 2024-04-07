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
    @JoinColumn(name = "chatroom_id", referencedColumnName = "roomId")
    private ChatRoomEntity chatroom;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "hashtag_id", referencedColumnName = "tag_id")
    private HashTagEntity hashtag;

    public ChatRoomHashtagEntity() {}
}
