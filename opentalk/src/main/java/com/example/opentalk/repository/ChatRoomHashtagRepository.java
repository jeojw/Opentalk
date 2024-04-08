package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomHashtagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomHashtagRepository extends JpaRepository<ChatRoomHashtagEntity, Long> {
//    @Query(value = "SELECT chatroom_id FROM Opentalk.chatroom_hashtag WHERE h")
//    List<ChatRoomHashtagEntity> searchRoomTags(@Param("keyword") String keyword);
}
