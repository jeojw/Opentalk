package com.example.opentalk.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class ChatRoomDTO {

    private String roomId;
    private String manager;
    private String name;
    private boolean existLock;
    private String roomPassword;
    private String introduction;
    private Integer limitParticipates;
    private List<Integer> talkers;
    private List<HashTagDTO> roomTags;
    private Set<WebSocketSession> sessions = new HashSet<>();

    public static ChatRoomDTO create(String name, String roomPassword, String manager,
                                     Integer limitParticipates, String introduction,
                                     List<HashTagDTO> roomTags){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.name = name;
        room.manager = manager;
        room.roomPassword = roomPassword;
        room.limitParticipates = limitParticipates;
        room.introduction = introduction;
        room.existLock = room.roomPassword.isEmpty();
        room.roomTags = roomTags;
        return room;
    }
}
