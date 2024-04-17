package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberInviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;

public interface MemberInviteRepository extends JpaRepository<MemberInviteEntity, Long> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.member_invite WHERE open_talk_member_id =:member_id AND invite_message_id =:invite_id",
    nativeQuery = true)
    void deleteEntity(@Param("invite_id") Long inviteId, @Param("member_id") Long memberId);
}
