package com.example.opentalk.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ChatRoomRole {
    ROLE_PARTICIPATE("PARTICIPATE"),
    ROLE_MANAGER("MANAGER");

    private final String value;

    ChatRoomRole(String value){
        this.value = value;
    }

    @JsonValue
    public String getValue(){
        return value;
    }

    @JsonCreator
    public static ChatRoomRole fromValue(String value){
        for (ChatRoomRole role : ChatRoomRole.values()){
            if (role.value.equalsIgnoreCase(value)){
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid ChatRoomRole value: " + value);
    }
}
