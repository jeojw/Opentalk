package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMemberEntity, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Opentalk.chatroom_member(chatroom_id, member_id) Values(:room_id, :member_id)",
            nativeQuery = true)
    int enterRoom(@Param("room_id") String room_id, @Param("member_id") String member_id);

    @Query(value = "SELECT * FROM Opentalk.chatroom_member WHERE chatroom_id = :room_id AND member_id = :member_id",
            nativeQuery = true)
    ChatRoomMemberEntity findMember(@Param("room_id") String room_id , @Param("member_id") String member_id);

    @Query(value = "SELECT member_id FROM Opentalk.chatroom_member WHERE room_id = :roomId"
            ,nativeQuery = true)
    List<String> findMembers(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chatroom_member WHERE chatroom_id = :room_id AND member_id = :member_id", nativeQuery = true)
    int exitRoom(@Param("room_id") String room_id , @Param("member_id") String member_id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM Opentalk.chatroom_member WHERE chatroom_id = :room_id", nativeQuery = true)
    int deleteRoom(@Param("room_id") String room_id);
}
