package com.example.opentalk.repository;

import com.example.opentalk.entity.PersonalMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PersonalMessageRepository extends JpaRepository<PersonalMessageEntity, Long> {

    @Query(value = "SELECT * FROM Opentalk.personal_message WHERE receiver =:memberNickName", nativeQuery = true)
    Optional<List<PersonalMessageEntity>> getAllMessages(@Param("memberNickName") String memberNickName);

    @Query(value = "SELECT * FROM Opentalk.personal_message WHERE message_id = :messageId", nativeQuery = true)
    Optional<PersonalMessageEntity> getMessage(@Param("messageId") String messageId);
}
