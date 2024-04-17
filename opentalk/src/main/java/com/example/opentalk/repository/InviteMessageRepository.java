package com.example.opentalk.repository;

import com.example.opentalk.entity.InviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InviteMessageRepository extends JpaRepository<InviteEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.invite_message WHERE invited_member =:memberNickName", nativeQuery = true)
    Optional<List<InviteEntity>> getAllInvitedMessages(@Param("memberNickName") String memberNickName);
}
