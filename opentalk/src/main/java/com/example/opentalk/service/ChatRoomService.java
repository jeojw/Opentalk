package com.example.opentalk.service;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.dto.MemberDTO;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.ChatRoomMemberEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatRoomMemberRepository;
import com.example.opentalk.repository.ChatRoomRepository;
import com.example.opentalk.repository.HashTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomService {
    private  final ChatRoomRepository chatRoomRepository;
    private final HashTagRepository hashTagRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);

        return chatRoomEntity.getRoomId();
    }

    public void enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        System.out.print(chatRoomMemberEntity.getId());
        chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getId(),
                                            chatRoomMemberEntity.getChatroom().getRoomId(),
                                            chatRoomMemberEntity.getMember().getMemberId());
    }

    public void exitRoom(ChatRoomDTO chatRoomDTO, MemberDTO memberDTO){
        ChatRoomEntity chatRoom = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        MemberEntity member = MemberEntity.toMemberEntity(memberDTO);
        ChatRoomMemberEntity chatRoomMemberEntity = new ChatRoomMemberEntity();

        chatRoomMemberRepository.delete(chatRoomMemberEntity);
    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        System.out.print(chatRoomEntityList);
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }


    public void deleteRoom(String roomId){

    }
}
