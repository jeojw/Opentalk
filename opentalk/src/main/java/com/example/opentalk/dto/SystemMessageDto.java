package com.example.opentalk.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SystemMessageDto {
    private String roomId;
    private String nickName;
    private LocalDateTime timeStamp;
    private String message;
}
