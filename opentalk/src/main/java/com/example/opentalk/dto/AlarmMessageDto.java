package com.example.opentalk.dto;

import com.example.opentalk.entity.AlarmType;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Getter
@Setter
public class AlarmMessageDto {
    private String messageId = UUID.randomUUID().toString();
    private String memberNickName;
    private AlarmType alarmType;
    private String alarmMessage;

    public AlarmMessageDto() {}

    @Builder
    public AlarmMessageDto(String messageId, String memberNickName, AlarmType alarmType, String alarmMessage){
        this.messageId = messageId;
        this.memberNickName = memberNickName;
        this.alarmType = alarmType;
        this.alarmMessage = alarmMessage;
    }
}
