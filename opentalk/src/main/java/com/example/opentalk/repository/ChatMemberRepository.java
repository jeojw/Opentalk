package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatMemberEntity;
import com.example.opentalk.entity.ChatRoomRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMemberRepository extends JpaRepository<ChatMemberEntity, Long> {
    @Modifying
    @Query(value = "INSERT INTO Opentalk.chat_member_list(role, member_id, member_nick_name, room_id) Values(:role, :member_id, :member_nickname, :room_id)",
            nativeQuery = true)
    int enterRoom(@Param("role") ChatRoomRole role, @Param("room_id") String room_id,
                  @Param("member_id") String member_id, @Param("member_nickname") String member_nickname);
}
