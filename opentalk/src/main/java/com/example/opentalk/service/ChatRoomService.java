package com.example.opentalk.service;

import com.example.opentalk.dto.ChatMessageDTO;
import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.entity.ChatMessageEntity;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.ChatRoomMemberEntity;
import com.example.opentalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomService {
    private final ChatMemberRepository chatMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final HashTagRepository hashTagRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);

        return chatRoomEntity.getRoomId();
    }

    public ChatRoomDTO getRoom(String roomId){
        ChatRoomEntity chatRoomEntity = chatRoomRepository.getRoom(roomId);

        return ChatRoomDTO.toChatRoomDTO(chatRoomEntity);
    }

    public boolean checkPassword(String roomId, String inputPassword){
        String roomPw = chatRoomRepository.existPassword(roomId);
        return inputPassword.equals(roomPw);
    }

    public void saveChat(ChatMessageDTO chatMessage){
        chatMessageRepository.save(ChatMessageEntity.toChatMessageEntity(chatMessage));
    }

    public void deleteRome(){

    }

    public void enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        chatRoomRepository.enterRoom(chatRoomMemberEntity.getMember().getMemberId());
        chatMemberRepository.enterRoom(
                chatRoomMemberEntity.getMember().getRole(),
                chatRoomMemberEntity.getChatroom().getRoomId(),
                chatRoomMemberEntity.getMember().getMemberId(),
                chatRoomMemberEntity.getMember().getMemberNickName());
        chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getId(),
                chatRoomMemberEntity.getChatroom().getRoomId(),
                chatRoomMemberEntity.getMember().getMemberId());
    }

    public void enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        if (inputPw.equals(chatRoomMemberEntity.getChatroom().getRoomPassword())){
            chatRoomRepository.enterRoom(chatRoomMemberEntity.getMember().getMemberId());
            chatMemberRepository.enterRoom(
                    chatRoomMemberEntity.getMember().getRole(),
                    chatRoomMemberEntity.getChatroom().getRoomId(),
                    chatRoomMemberEntity.getMember().getMemberId(),
                    chatRoomMemberEntity.getMember().getMemberNickName());
            chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getId(),
                    chatRoomMemberEntity.getChatroom().getRoomId(),
                    chatRoomMemberEntity.getMember().getMemberId());
        }
        else return;
    }

    public void exitRoom(String room_id, String member_id){
        ChatRoomMemberEntity chatRoomMemberEntity = chatRoomMemberRepository.findMember(room_id, member_id);

        chatRoomRepository.exitRoom(chatRoomMemberEntity.getChatroom().getRoomId());
        chatRoomMemberRepository.exitRoom(chatRoomMemberEntity.getChatroom().getRoomId(),
                chatRoomMemberEntity.getMember().getMemberId());
        chatMemberRepository.exitRoom(chatRoomMemberEntity.getChatroom().getRoomId(),
                                        chatRoomMemberEntity.getMember().getMemberId());


    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }

}
