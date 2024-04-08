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
    private String roomName;
    private boolean existLock;
    private String roomPassword;
    private String introduction;
    private Integer limitParticipates;
    private List<HashTagDTO> roomTags;
    private List<MemberResponseDto> members;

    public static ChatRoomDTO create(String roomName, String roomPassword, Integer limitParticipates, String introduction,
                                     List<MemberResponseDto> talkers, List<HashTagDTO> roomTags){
        ChatRoomDTO room = new ChatRoomDTO();

        room.roomId = UUID.randomUUID().toString();
        room.roomName = roomName;
        room.roomPassword = roomPassword;
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
        List<MemberResponseDto> chatMemberDtoList = new ArrayList<>();
        for (ChatRoomHashtagEntity hashTagEntity : chatRoomEntity.getHashtags()){
            hashTagDTOList.add(HashTagDTO.toHashTagDTO(hashTagEntity));
        }
        for (ChatRoomMemberEntity memberEntity : chatRoomEntity.getMembers()){
            chatMemberDtoList.add(MemberResponseDto.of(memberEntity.getMember()));
        }

        chatRoomDTO.setRoomId(chatRoomEntity.getRoomId());
        chatRoomDTO.setRoomName(chatRoomEntity.getRoomName());
        chatRoomDTO.setRoomPassword(chatRoomEntity.getRoomPassword());
        chatRoomDTO.setExistLock(chatRoomEntity.isExistLock());
        chatRoomDTO.setIntroduction(chatRoomEntity.getIntroduction());
        chatRoomDTO.setLimitParticipates(chatRoomEntity.getLimitParticipates());
        chatRoomDTO.setRoomTags(hashTagDTOList);
        chatRoomDTO.setMembers(chatMemberDtoList);

        return chatRoomDTO;
    }
}
