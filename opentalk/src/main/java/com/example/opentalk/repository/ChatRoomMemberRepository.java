package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomMemberEntity;
import com.example.opentalk.entity.ChatRoomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMemberEntity, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Opentalk.chatroom_member(opentalk_room_list_id, open_talk_member_id, role) Values(:room_id, :member_id, :memberRole)",
            nativeQuery = true)
    int enterRoom(@Param("room_id") Long room_id, @Param("member_id") Long member_id, @Param("memberRole") ChatRoomRole memberRole);

    @Query(value = "SELECT * FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :room_id",
            nativeQuery = true)
    Optional<ChatRoomMemberEntity> findByRoomId(@Param("room_id") Long room_id);

    @Query(value = "SELECT * FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :room_id AND open_talk_member_id = :member_id",
            nativeQuery = true)
    Optional<ChatRoomMemberEntity> findByRoomMemberId(@Param("room_id") Long room_id, @Param("member_id") Long member_id);

    @Query(value = "SELECT * FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :room_id AND member_id = :member_id",
            nativeQuery = true)
    Optional<ChatRoomMemberEntity> findMember(@Param("room_id") String room_id , @Param("member_id") String member_id);

    @Query(value = "SELECT * FROM Opentalk.chatroom_member",
            nativeQuery = true)
    List<Optional<ChatRoomMemberEntity>> getAllRooms();

    @Query(value = "SELECT open_talk_member_id FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :roomId"
            ,nativeQuery = true)
    List<Optional<String>> findMembers(@Param("roomId") Long roomId);

    @Query(value = "SELECT COUNT(case when opentalk_room_list_id=:roomId then 1 end) FROM Opentalk.chatroom_member",
            nativeQuery = true)
    int getParticipates(@Param("roomId") Long roomId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :roomId AND open_talk_member_id = :memberId",
            nativeQuery = true)
    void deleteMember(@Param("roomId") Long roomId, @Param("memberId") Long memberId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chatroom_member WHERE open_talk_member_id = :memberId",
            nativeQuery = true)
    void forcedExitRoom(@Param("memberId") Long memberId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chatroom_member WHERE opentalk_room_list_id = :room_id AND open_talk_member_id = :member_id", nativeQuery = true)
    void exitRoom(@Param("room_id") String room_id , @Param("member_id") String member_id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.chatroom_member SET role = 'ROLE_MANAGER' " +
            "WHERE opentalk_room_list_id = :roomId AND open_talk_member_id = :memberId",
            nativeQuery = true)
    void setManager(@Param("roomId") Long roomId, @Param("memberId") Long memberId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.chatroom_member SET role = 'ROLE_PARTICIPATE' " +
            "WHERE opentalk_room_list_id = :roomId AND open_talk_member_id = :memberId",
            nativeQuery = true)
    void setParticipate(@Param("roomId") Long roomId, @Param("memberId") Long memberId);

    @Query(value = "SELECT EXISTS (SELECT * FROM Opentalk.chatroom_member " +
            "WHERE opentalk_room_list_id = :roomId AND open_talk_member_id = :memberId) as success",
            nativeQuery = true)
    BigInteger existByRoomMemberId(@Param("roomId") Long roomId, @Param("memberId") Long memberId);
}
