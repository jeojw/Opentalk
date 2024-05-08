package com.example.opentalk.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AlarmType {
    PERSONAL("PERSONAL", "쪽지"),
    INVITE("INVITE", "초대");

    private final String key;
    private final String value;
}
