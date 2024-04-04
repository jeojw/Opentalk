package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.HashTagEntity;
import com.example.opentalk.entity.MemberEntity;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.web.socket.WebSocketSession;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.*;

@Getter
@Setter
@Data
@ToString
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

    public static ChatRoomDTO create(String roomName, String roomPassword, String manager,
                                     Integer limitParticipates, String introduction,
                                     List<MemberDTO> members, List<HashTagDTO> roomTags){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.roomName = roomName;
        room.manager = manager;
        room.roomPassword = roomPassword;
        room.participates = members.size();
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
        chatRoomDTO.setManager(chatRoomEntity.getManager());
        chatRoomDTO.setRoomName(chatRoomEntity.getRoomName());
        chatRoomDTO.setRoomPassword(chatRoomEntity.getRoomPassword());
        chatRoomDTO.setExistLock(chatRoomEntity.isExistLock());
        chatRoomDTO.setIntroduction(chatRoomEntity.getIntroduction());
        chatRoomDTO.setParticipates(chatRoomEntity.getParticipates());
        chatRoomDTO.setLimitParticipates(chatRoomEntity.getLimitParticipates());
        chatRoomDTO.setRoomTags(hashTagDTOList);
        chatRoomDTO.setMembers(memberDTOList);

        return chatRoomDTO;
    }
}
