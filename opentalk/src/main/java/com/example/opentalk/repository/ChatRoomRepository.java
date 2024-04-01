package com.example.opentalk.repository;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.*;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {

}
