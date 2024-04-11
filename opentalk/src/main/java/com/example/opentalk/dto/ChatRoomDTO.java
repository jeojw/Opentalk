package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.ChatRoomHashtagEntity;
import com.example.opentalk.entity.ChatRoomMemberEntity;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Data
@ToString
public class ChatRoomDTO {

    private String roomId = UUID.randomUUID().toString();
    private String roomName;
    private boolean existLock;
    private String roomManager;
    private String roomPassword;
    private String introduction;
    private Integer curParticipates;
    private Integer limitParticipates;
    private List<HashTagDTO> roomTags;
    private List<MemberResponseDto> members;

    public ChatRoomDTO() {}

    @Builder
    public ChatRoomDTO (String roomId, String roomName, String roomPassword, Integer limitParticipates,
                        Integer curParticipates, String introduction, String roomManager,
                        List<MemberResponseDto> talkers, List<HashTagDTO> roomTags){
        this.roomId = roomId;
        this.roomName = roomName;
        this.roomPassword = roomPassword;
        this.curParticipates = curParticipates;
        this.limitParticipates = limitParticipates;
        this.introduction = introduction;
        this.existLock = !this.roomPassword.isEmpty();
        this.roomManager = roomManager;
        this.members = talkers;
        this.roomTags = roomTags;
    }
    public static ChatRoomDTO toChatRoomDTO(ChatRoomEntity chatRoomEntity) {

        List<HashTagDTO> hashTagDTOList = new ArrayList<>();
        List<MemberResponseDto> chatMemberDtoList = new ArrayList<>();
        for (ChatRoomHashtagEntity hashTagEntity : chatRoomEntity.getHashtags()){
            hashTagDTOList.add(HashTagDTO.toHashTagDTO(hashTagEntity));
        }
        for (ChatRoomMemberEntity memberEntity : chatRoomEntity.getMembers()){
            chatMemberDtoList.add(MemberResponseDto.of(memberEntity.getMember()));
        }

        return ChatRoomDTO.builder()
                .roomId(chatRoomEntity.getRoomId())
                .roomName(chatRoomEntity.getRoomName())
                .roomPassword(chatRoomEntity.getRoomPassword())
                .limitParticipates(chatRoomEntity.getLimitParticipates())
                .introduction(chatRoomEntity.getIntroduction())
                .roomManager(chatRoomEntity.getRoomManager())
                .roomTags(hashTagDTOList)
                .talkers(chatMemberDtoList)
                .build();
    }
}
