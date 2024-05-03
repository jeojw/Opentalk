package com.example.opentalk.repository;

import com.example.opentalk.entity.InviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

public interface InviteMessageRepository extends JpaRepository<InviteEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.invite_message WHERE invited_member =:memberNickName", nativeQuery = true)
    Optional<List<InviteEntity>> getAllInvitedMessages(@Param("memberNickName") String memberNickName);

    @Query(value = "SELECT * FROM Opentalk.invite_message WHERE invite_id =:invite_id",
            nativeQuery = true)
    Optional<InviteEntity> getInviteMessage(@Param("invite_id") String inviteId);

    @Query(value = "SELECT EXISTS (SELECT * FROM Opentalk.invite_message WHERE room_id = :roomId AND inviter = :inviter AND invited_member = :invited_member) as success",
            nativeQuery = true)
    BigInteger isExistMessage(@Param("roomId") String roomId, @Param("inviter") String inviter, @Param("invited_member") String invited_member);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.invite_message WHERE invite_id = :invite_id",
            nativeQuery = true)
    void deleteMessage(@Param("invite_id") String inviteId);
}
