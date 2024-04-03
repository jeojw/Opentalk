package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMemberEntity, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Opentalk.chatroom_member Values(:id, :room_id, :member_id)",
            nativeQuery = true)
    int enterRoom(@Param("id") Long id, @Param("room_id") String room_id, @Param("member_id") String member_id);
}
