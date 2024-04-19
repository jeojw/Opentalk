package com.example.opentalk.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ChatRoomRole {
    ROLE_PARTICIPATE("PARTICIPATE", "일반 참여자"),
    ROLE_MANAGER("MANAGER", "방장");

    private final String key;
    private final String title;
}
