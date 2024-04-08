package com.example.opentalk.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Data
public class ChatRoomRequestDto {
    private String manager;
    private String roomName;
    private boolean existLock;
    private String roomPassword;
    private String introduction;
    private Integer limitParticipates;
    private Integer participates;
    private List<HashTagDTO> roomTags;
    private List<ChatMemberDto> members;
}
