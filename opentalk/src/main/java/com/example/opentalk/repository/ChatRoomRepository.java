package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list",
            nativeQuery = true)
    List<ChatRoomEntity> findAllRoom();

    @Query(value = "SELECT room_password FROM Opentalk.opentalk_room_list WHERE room_id = :roomId",
            nativeQuery = true)
    String existPassword(@Param("roomId") String roomId);

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE room_id = :roomId"
            ,nativeQuery = true)
    Optional<ChatRoomEntity> getRoom(@Param("roomId") String roomId);
}
