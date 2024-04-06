package com.example.opentalk;

import com.example.opentalk.entity.ChatRoomRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ChatRoomRoleTest {
    @Test
    public void testSerialization() throws Exception {
        // Serialize Enum to JSON
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(ChatRoomRole.ROLE_MANAGER);
        System.out.print(json);
        assertEquals("\"MANAGER\"", json);
    }

    @Test
    public void testDeserialization() throws Exception {
        // Deserialize JSON to Enum
        ObjectMapper mapper = new ObjectMapper();
        ChatRoomRole role = mapper.readValue("\"PARTICIPATE\"", ChatRoomRole.class);
        System.out.print(role);
        assertEquals(ChatRoomRole.ROLE_PARTICIPATE, role);
    }
}
