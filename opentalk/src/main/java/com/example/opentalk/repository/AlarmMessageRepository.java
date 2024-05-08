package com.example.opentalk.repository;

import com.example.opentalk.entity.AlarmMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AlarmMessageRepository extends JpaRepository<AlarmMessageEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.alarm_message WHERE member_nick_name =:memberNickName", nativeQuery = true)
    Optional<List<AlarmMessageEntity>> getAllAlarmMessages(@Param("memberNickName") String memberNickName);

    @Query(value = "SELECT * FROM Opentalk.alarm_message WHERE message_id = :messageId", nativeQuery = true)
    Optional<AlarmMessageEntity> getAlarmMessage(@Param("messageId") String messageId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.alarm_message WHERE message_id = :message_id",
            nativeQuery = true)
    void deleteMessage(@Param("message_id") String messageId);
}
