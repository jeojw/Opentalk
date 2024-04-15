package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomHashtagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface ChatRoomHashtagRepository extends JpaRepository<ChatRoomHashtagEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.chatroom_hashtag WHERE opentalk_room_list_id = :room_id",
            nativeQuery = true)
    List<Optional<ChatRoomHashtagEntity>> findByRoomId(@Param("room_id") Long room_id);

    @Query(value = "SELECT opentalk_room_list_id FROM Opentalk.chatroom_hashtag WHERE tag_id = :tag_id", nativeQuery = true)
    List<Optional<Long>> findByRoomTag(@Param("tag_id") Long tag_id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO Opentalk.chatroom_hashtag(tag_id, opentalk_room_list_id) Values(:tagId, :roomId)", nativeQuery = true)
    void SaveTagRoom(@Param("tagId") Long tagId, @Param("roomId") Long roomId);
}
