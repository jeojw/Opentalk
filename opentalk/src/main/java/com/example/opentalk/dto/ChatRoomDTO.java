package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.HashTagEntity;
import com.example.opentalk.entity.MemberEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.*;

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
    private Integer participates;
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
        room.participates = 0;
        room.limitParticipates = limitParticipates;
        room.introduction = introduction;
        room.existLock = room.roomPassword.isEmpty();
        room.roomTags = roomTags;
        return room;
    }
    public static ChatRoomDTO toChatRoomDTO(ChatRoomEntity chatRoomEntity){
        ChatRoomDTO chatRoomDTO = new ChatRoomDTO();
        List<HashTagDTO> hashTagDTOList = new ArrayList<>();
        for (HashTagEntity hashTagEntity : chatRoomEntity.getHashtags()){
            hashTagDTOList.add(HashTagDTO.toHashTagDTO(hashTagEntity));
        }

        chatRoomDTO.setRoomId(chatRoomEntity.getRoomId());
        chatRoomDTO.setManager(chatRoomDTO.getManager());
        chatRoomDTO.setName(chatRoomDTO.getName());
        chatRoomDTO.setRoomPassword(chatRoomDTO.getRoomPassword());
        chatRoomDTO.setExistLock(chatRoomDTO.isExistLock());
        chatRoomDTO.setIntroduction(chatRoomDTO.getIntroduction());
        chatRoomDTO.setParticipates(chatRoomDTO.getParticipates());
        chatRoomDTO.setLimitParticipates(chatRoomDTO.getLimitParticipates());
        chatRoomDTO.setRoomTags(hashTagDTOList);

        return chatRoomDTO;
    }
}
