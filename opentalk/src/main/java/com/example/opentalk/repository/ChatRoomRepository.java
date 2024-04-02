package com.example.opentalk.repository;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.*;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list",
            nativeQuery = true)
    List<ChatRoomEntity> findAllRoom();
}
