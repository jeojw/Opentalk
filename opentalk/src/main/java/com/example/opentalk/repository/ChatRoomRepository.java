package com.example.opentalk.repository;

import com.example.opentalk.dto.ChatRoomDTO;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.*;

@Repository
public class ChatRoomRepository {
    private Map<String, ChatRoomDTO> chatRoomDTOMap;

    @PostConstruct
    private void init(){
        chatRoomDTOMap = new LinkedHashMap<>();
    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomDTO> result = new ArrayList<>(chatRoomDTOMap.values());
        Collections.reverse(result);

        return result;
    }

    public ChatRoomDTO findRoomById(String id){
        return chatRoomDTOMap.get(id);
    }

    public String createChatRoomDTO(String name, String password, String manager, Integer count){
        ChatRoomDTO room = ChatRoomDTO.create(name, password, manager, count);
        chatRoomDTOMap.put(room.getRoomId(), room);

        return room.getRoomId();
    }
}
