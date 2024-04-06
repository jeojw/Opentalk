package com.example.opentalk;

import com.example.opentalk.entity.ChatRoomRole;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter
public class ChatRoleConverter implements AttributeConverter<ChatRoomRole, String> {
    @Override
    public String convertToDatabaseColumn(ChatRoomRole attribute){
        if (attribute == null){
            throw new IllegalArgumentException("ChatRole이 null입니다.");
        }

        return attribute.getValue();
    }

    @Override
    public ChatRoomRole convertToEntityAttribute(String dbData){
        if (dbData == null || dbData.isBlank()){
            throw new IllegalArgumentException("dbData가 비어있습니다.");
        }
        return ChatRoomRole.fromValue(dbData);
    }
}
