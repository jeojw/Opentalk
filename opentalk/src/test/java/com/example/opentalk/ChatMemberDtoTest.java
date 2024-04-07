package com.example.opentalk;

import com.example.opentalk.dto.ChatMemberDto;
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
}

