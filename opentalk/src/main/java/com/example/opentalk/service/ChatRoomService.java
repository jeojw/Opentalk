package com.example.opentalk.service;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.MemberDTO;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private  final ChatRoomRepository chatRoomRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);

        return chatRoomEntity.getRoomId();
    }

    public List<ChatRoomDTO> findAll(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }

    public void deleteRoom(String roomId){

    }
}
