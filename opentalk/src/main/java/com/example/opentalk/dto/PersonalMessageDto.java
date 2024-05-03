package com.example.opentalk.dto;

import lombok.*;

import java.util.UUID;

@Data
@Getter
@Setter
@Builder
public class PersonalMessageDto {
    private String messageId = UUID.randomUUID().toString();
    private String receiver;
    private String caller;
    private String message;

    PersonalMessageDto() {}

    @Builder
    public PersonalMessageDto(String messageId, String receiver, String caller, String message){
        this.messageId = messageId;
        this.receiver = receiver;
        this.caller = caller;
        this.message = message;
    }
}
