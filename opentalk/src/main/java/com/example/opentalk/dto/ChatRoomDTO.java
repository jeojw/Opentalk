package com.example.opentalk.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.HashSet;
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
    private Integer count;
    private Integer[] talkers;
    private Set<WebSocketSession> sessions = new HashSet<>();

    public static ChatRoomDTO create(String name, String roomPassword, String manager, Integer count){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.name = name;
        room.manager = manager;
        room.roomPassword = roomPassword;
        room.count = count;
        room.talkers = new Integer[count];
        room.existLock = room.roomPassword.isEmpty();
        return room;
    }
}
