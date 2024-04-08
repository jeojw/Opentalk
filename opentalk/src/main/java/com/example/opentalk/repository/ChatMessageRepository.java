package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.chat_log WHERE room_id = :roomId", nativeQuery = true)
    List<ChatMessageEntity> chatLog(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query(value = "DELETE * FROM Opentalk.chat_log WHERE room_id = :roomId", nativeQuery = true)
    int deleteLog(@Param("roomId") String roomId);
}
