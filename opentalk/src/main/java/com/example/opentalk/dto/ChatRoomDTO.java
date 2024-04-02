package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.HashTagEntity;
import com.example.opentalk.entity.MemberEntity;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.*;

@Getter
@Setter
@Data
public class ChatRoomDTO {

    private String roomId;
    private String manager;
    private String roomName;
    private boolean existLock;
    private String roomPassword;
    private String introduction;
    private Integer limitParticipates;
    private Integer participates;
    private List<HashTagDTO> roomTags;
    private List<MemberDTO> members;
    private Set<WebSocketSession> sessions = new HashSet<>();

    public static ChatRoomDTO create(String roomName, String roomPassword, String manager,
                                     Integer limitParticipates, String introduction,
                                     List<MemberDTO> members, List<HashTagDTO> roomTags){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.roomName = roomName;
        room.manager = manager;
        room.roomPassword = roomPassword;
        room.participates = 0;
        room.limitParticipates = limitParticipates;
        room.introduction = introduction;
        room.existLock = room.roomPassword.isEmpty();
        room.members = members;
        room.roomTags = roomTags;
        return room;
    }
    public static ChatRoomDTO toChatRoomDTO(ChatRoomEntity chatRoomEntity){
        ChatRoomDTO chatRoomDTO = new ChatRoomDTO();
        List<HashTagDTO> hashTagDTOList = new ArrayList<>();
        List<MemberDTO> memberDTOList = new ArrayList<>();
        for (HashTagEntity hashTagEntity : chatRoomEntity.getHashtags()){
            hashTagDTOList.add(HashTagDTO.toHashTagDTO(hashTagEntity));
        }
        for (MemberEntity memberEntity : chatRoomEntity.getMembers()){
            memberDTOList.add(MemberDTO.toMemberDTO(memberEntity));
        }

        chatRoomDTO.setRoomId(chatRoomEntity.getRoomId());
        chatRoomDTO.setManager(chatRoomDTO.getManager());
        chatRoomDTO.setRoomName(chatRoomDTO.getRoomName());
        chatRoomDTO.setRoomPassword(chatRoomDTO.getRoomPassword());
        chatRoomDTO.setExistLock(chatRoomDTO.isExistLock());
        chatRoomDTO.setIntroduction(chatRoomDTO.getIntroduction());
        chatRoomDTO.setParticipates(chatRoomDTO.getParticipates());
        chatRoomDTO.setLimitParticipates(chatRoomDTO.getLimitParticipates());
        chatRoomDTO.setRoomTags(hashTagDTOList);
        chatRoomDTO.setMembers(memberDTOList);

        return chatRoomDTO;
    }
}
