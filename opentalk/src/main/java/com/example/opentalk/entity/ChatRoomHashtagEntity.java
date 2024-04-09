package com.example.opentalk.entity;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import lombok.Builder;
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
    @JoinColumn(name = "tag_id")
    private HashTagEntity hashtag;

    public ChatRoomHashtagEntity() {}

    @Builder
    public ChatRoomHashtagEntity(ChatRoomEntity chatroom, HashTagEntity hashtag) {
        this.chatroom = chatroom;
        this.hashtag = hashtag;
    }

    public static ChatRoomHashtagEntity toChatRoomHashtagEntity(ChatRoomDTO chatRoomDTO, HashTagDTO hashTagDTO){
        return ChatRoomHashtagEntity.builder()
                .chatroom(ChatRoomEntity.toChatRoomEntity(chatRoomDTO))
                .hashtag(HashTagEntity.toHashTagEntity(hashTagDTO))
                .build();
    }
}
