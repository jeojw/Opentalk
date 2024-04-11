package com.example.opentalk.repository;

import com.example.opentalk.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list",
            nativeQuery = true)
    List<ChatRoomEntity> findAllRoom();

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE room_id=:roomId",
            nativeQuery = true)
    Optional<ChatRoomEntity> findByRoomId(@Param("roomId") String roomId);

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE room_name LIKE %:keyword%",
            nativeQuery = true)
    List<ChatRoomEntity> searchRoomsByTitle(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE room_manager LIKE %:keyword%",
            nativeQuery = true)
    List<ChatRoomEntity> searchRoomsByManager(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE id=:room_id",
            nativeQuery = true)
    List<ChatRoomEntity> searchRoomsByTags(@Param("room_id") Long room_id);

    @Query(value = "SELECT room_password FROM Opentalk.opentalk_room_list WHERE room_id = :roomId",
            nativeQuery = true)
    String existPassword(@Param("roomId") String roomId);

    @Query(value = "SELECT * FROM Opentalk.opentalk_room_list WHERE room_id = :roomId"
            ,nativeQuery = true)
    Optional<ChatRoomEntity> getRoom(@Param("roomId") String roomId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.opentalk_room_list SET room_manager=:manager WHERE room_id=:roomId",
            nativeQuery = true)
    void updateManager(@Param("roomId") String roomId, @Param("manager") String manager);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.opentalk_room_list " +
            "SET exist_lock = :exist_lock, introduction = :introduction, limit_participates = :limit_participates," +
            "room_password = :room_password, room_name = :room_name WHERE room_id = :room_id",
            nativeQuery = true)
    void changeRoomOption(@Param("exist_lock") boolean exist_lock,
                             @Param("introduction") String introduction,
                             @Param("limit_participates") Integer limit_participates,
                             @Param("room_password") String room_password,
                             @Param("room_name") String room_name,
                             @Param("room_id") String room_id);
}
