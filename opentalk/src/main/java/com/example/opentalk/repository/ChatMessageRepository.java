package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Opentalk.chat_log(opentalk_room_list_id, open_talk_member_id, time_stamp, message)" +
            " Values(:roomId, :memberId, :timeStamp, :message)", nativeQuery = true)
    int saveChat(@Param("roomId") Long roomId, @Param("memberId") Long memberId,
                 @Param("timeStamp") LocalDateTime timeStamp, @Param("message") String message);

    @Query(value = "SELECT * FROM Opentalk.chat_log WHERE opentalk_room_list_id = :roomId", nativeQuery = true)
    List<ChatMessageEntity> chatLog(@Param("roomId") Long roomId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chat_log WHERE opentalk_room_list_id = :roomId", nativeQuery = true)
    int deleteLog(@Param("roomId") Long roomId);
}
