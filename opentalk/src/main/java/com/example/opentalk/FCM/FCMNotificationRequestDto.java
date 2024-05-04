package com.example.opentalk.FCM;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FCMNotificationRequestDto {
    private String targetUserId;
    private String title;
    private String body;

    @Builder
    public FCMNotificationRequestDto(String targetUserId, String title, String body){
        this.targetUserId = targetUserId;
        this.title = title;
        this.body = body;
    }
}
