package com.example.opentalk.repository;

import com.example.opentalk.entity.InviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface InviteMessageRepository extends JpaRepository<InviteEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.invite_message WHERE invited_member =:memberNickName", nativeQuery = true)
    Optional<List<InviteEntity>> getAllInvitedMessages(@Param("memberNickName") String memberNickName);

    @Query(value = "SELECT * FROM Opentalk.invite_message WHERE inviter =:inviter AND invited_member =:invited_member",
            nativeQuery = true)
    Optional<InviteEntity> getInviteMessage(@Param("inviter") String inviter, @Param("invited_member") String invitedMember);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.invite_message WHERE invited_member =:invitedMemberNickName AND inviter =:inviterNickName",
            nativeQuery = true)
    void deleteMessage(@Param("invitedMemberNickName") String invitedMemberNickName, @Param("inviterNickName") String inviterNickName);
}
