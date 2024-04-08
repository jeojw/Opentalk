package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.ChatRoomHashtagEntity;
import com.example.opentalk.entity.ChatRoomMemberEntity;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    private List<ChatMemberDto> members;

    public static ChatRoomDTO create(String roomName, String roomPassword, String manager,
                                     Integer limitParticipates, String introduction,
                                     List<ChatMemberDto> talkers, List<HashTagDTO> roomTags){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.roomName = roomName;
        room.manager = manager;
        room.roomPassword = roomPassword;
        room.participates = talkers.size();
        room.limitParticipates = limitParticipates;
        room.introduction = introduction;
        room.existLock = room.roomPassword.isEmpty();
        room.members = talkers;
        room.roomTags = roomTags;
        return room;
    }
    public static ChatRoomDTO toChatRoomDTO(ChatRoomEntity chatRoomEntity){
        ChatRoomDTO chatRoomDTO = new ChatRoomDTO();
        List<HashTagDTO> hashTagDTOList = new ArrayList<>();
        List<ChatMemberDto> chatMemberDtoList = new ArrayList<>();
        for (ChatRoomHashtagEntity hashTagEntity : chatRoomEntity.getHashtags()){
            hashTagDTOList.add(HashTagDTO.toHashTagDTO(hashTagEntity));
        }
        for (ChatRoomMemberEntity memberEntity : chatRoomEntity.getMembers()){
            chatMemberDtoList.add(ChatMemberDto.toChatMemberDto(memberEntity));
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
        chatRoomDTO.setMembers(chatMemberDtoList);

        return chatRoomDTO;
    }
}
