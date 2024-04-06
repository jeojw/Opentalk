package com.example.opentalk;

import com.example.opentalk.dto.ChatMemberDto;
import com.example.opentalk.entity.ChatMemberEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ChatMemberDtoTest {

    @Test
    public void testBuilder() {
        ChatMemberDto dto = ChatMemberDto.builder()
                .roomId("123")
                .memberId("456")
                .memberNickName("John")
                .role("PARTICIPATE")
                .build();

        assertEquals("123", dto.getRoomId());
        assertEquals("456", dto.getMemberId());
        assertEquals("John", dto.getMemberNickName());
        assertEquals("PARTICIPATE", dto.getRole());
    }

    @Test
    public void testStaticFactoryMethod() {
        ChatMemberEntity entity = new ChatMemberEntity("123", "456", "John", "MANAGER");
        ChatMemberDto dto = ChatMemberDto.toChatMemberDto(entity);

        assertEquals("123", dto.getRoomId());
        assertEquals("456", dto.getMemberId());
        assertEquals("John", dto.getMemberNickName());
        assertEquals("MANAGER", dto.getRole());
    }
}

