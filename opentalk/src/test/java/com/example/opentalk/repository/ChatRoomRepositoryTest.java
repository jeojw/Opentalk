package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class ChatRoomRepositoryTest {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Test
    public void testSearchRoomManager() {
        String keyword = "managerKeyword"; // 키워드 설정

        List<ChatRoomEntity> rooms = chatRoomRepository.searchRoomManager("%" + keyword + "%");

        // 결과 확인
        for (ChatRoomEntity room : rooms) {
            System.out.println("Room Name: " + room.getRoomName());
            System.out.println("Manager: " + room.getManager());
        }
    }

    @Test
    public void testSearchRoomName() {
        String keyword = "nameKeyword"; // 키워드 설정

        List<ChatRoomEntity> rooms = chatRoomRepository.searchRoomName("%" + keyword + "%");

        // 결과 확인
        for (ChatRoomEntity room : rooms) {
            System.out.println("Room Name: " + room.getRoomName());
            System.out.println("Manager: " + room.getManager());
        }
    }
}
