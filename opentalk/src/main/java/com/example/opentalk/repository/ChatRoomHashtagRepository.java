package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomHashtagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ChatRoomHashtagRepository extends JpaRepository<ChatRoomHashtagEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.chatroom_hashtag WHERE opentalk_room_list_id = :room_id",
            nativeQuery = true)
    Optional<ChatRoomHashtagEntity> findByRoomId(@Param("room_id") Long room_id);
}
