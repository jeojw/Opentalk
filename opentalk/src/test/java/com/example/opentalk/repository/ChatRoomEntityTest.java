package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class ChatRoomEntityTest {

    @Autowired
    private EntityManager entityManager;

    @Transactional
    @Test
    public void testBuilder() {
        // Given
        String roomId = "room123";
        String roomName = "Test Room";
        Integer limitParticipates = 10;
        String introduction = "This is a test room";
        boolean existLock = false;
        String roomManager = "test_manager";
        String roomPassword = "password123";

        // When
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.builder()
                .roomId(roomId)
                .roomName(roomName)
                .limitParticipates(limitParticipates)
                .introduction(introduction)
                .existLock(existLock)
                .roomManager(roomManager)
                .roomPassword(roomPassword)
                .build();

        entityManager.persist(chatRoomEntity);

        // Then
        System.out.println(chatRoomEntity.getId()); // Check if ID is not null
        assertEquals(roomId, chatRoomEntity.getRoomId());
        assertEquals(roomName, chatRoomEntity.getRoomName());
        assertEquals(limitParticipates, chatRoomEntity.getLimitParticipates());
        assertEquals(introduction, chatRoomEntity.getIntroduction());
        assertEquals(existLock, chatRoomEntity.isExistLock());
        assertEquals(roomManager, chatRoomEntity.getRoomManager());
        assertEquals(roomPassword, chatRoomEntity.getRoomPassword());
    }
}
