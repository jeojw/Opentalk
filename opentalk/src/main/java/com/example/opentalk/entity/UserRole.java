package com.example.opentalk.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ADMIN("ADMIN", "관리자"),
    USER("USER", "일반 사용자");

    private final String key;
    private final String title;
}