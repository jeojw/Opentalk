package com.example.opentalk.service;

import com.example.opentalk.dto.ChatMessageDTO;
import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.dto.SearchDto;
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
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);

        return chatRoomEntity.getRoomId();
    }

    public ChatRoomDTO getRoom(String roomId){

        if (chatRoomRepository.getRoom(roomId).isPresent()){
            ChatRoomEntity chatRoomEntity = chatRoomRepository.getRoom(roomId).get();
            return ChatRoomDTO.toChatRoomDTO(chatRoomEntity);
        }
        else
            return null;
    }

    public void changeRoomOption(){
    }

    public boolean checkPassword(String roomId, String inputPassword){
        String roomPw = chatRoomRepository.existPassword(roomId);
        return inputPassword.equals(roomPw);
    }

    public void saveChat(ChatMessageDTO chatMessage){
        chatMessageRepository.save(ChatMessageEntity.toChatMessageEntity(chatMessage));
    }

    public List<ChatMessageDTO> chatLog(String roomId){
        List<ChatMessageEntity> chatLogs= chatMessageRepository.chatLog(roomId);
        List<ChatMessageDTO> chatMessageDTOS = new ArrayList<>();
        for (ChatMessageEntity chat : chatLogs){
            chatMessageDTOS.add(ChatMessageDTO.toChatMessageDTO(chat));
        }
        return chatMessageDTOS;
    }

    public void deleteRome(String room_id){
        chatRoomRepository.deleteRoom(room_id);
        chatMessageRepository.deleteLog(room_id);
    }

    public void deleteRome_Pw(String password, String room_id){
        chatRoomRepository.deleteRoom(room_id);
    }

    public void enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        chatRoomRepository.enterRoom(chatRoomMemberEntity.getMember().getMemberId());
        chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getChatroom().getRoomId(),
                chatRoomMemberEntity.getMember().getMemberId());
    }

    public void enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        if (inputPw.equals(chatRoomMemberEntity.getChatroom().getRoomPassword())){
            chatRoomRepository.enterRoom(chatRoomMemberEntity.getMember().getMemberId());
            chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getChatroom().getRoomId(),
                    chatRoomMemberEntity.getMember().getMemberId());
        }
        else return;
    }

    public void exitRoom(String room_id, String member_id){
        chatRoomRepository.exitRoom(room_id);
        chatRoomMemberRepository.exitRoom(room_id, member_id);
    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }

    public List<ChatRoomDTO> searchRoom(SearchDto searchDto){
        List<ChatRoomEntity> chatRoomList = new ArrayList<>();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        if (searchDto.getType().equals("NAME")){
            chatRoomList = chatRoomRepository.searchRoomName(searchDto.getKeyword());
        }
        else if (searchDto.getType().equals("MANAGER")){
            chatRoomList = chatRoomRepository.searchRoomManager(searchDto.getKeyword());
        }
//        else if (searchDto.getType().equals("TAG")){
//            List<ChatRoomHashtagEntity> chatRoomHashtagEntities = new ArrayList<>();
//            chatRoomHashtagEntities = chatRoomHashtagRepository.searchRoomTags(searchDto.getKeyword());
//        }

        for (ChatRoomEntity chatRoom : chatRoomList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoom));
        }

        return chatRoomDTOList;
    }

}
