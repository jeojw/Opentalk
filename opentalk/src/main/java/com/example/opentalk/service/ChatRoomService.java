package com.example.opentalk.service;

import com.example.opentalk.dto.ChatMessageDTO;
import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.entity.ChatMessageEntity;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.ChatRoomMemberEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatMessageRepository;
import com.example.opentalk.repository.ChatRoomMemberRepository;
import com.example.opentalk.repository.ChatRoomRepository;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);
        return chatRoomEntity.getRoomId();
    }

    public ChatRoomMemberDTO getRoom(String roomId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);
        if (chatRoomEntity.isPresent()) {
            if (chatRoomMemberRepository.findByRoomId(chatRoomEntity.get().getId()).isPresent()) {
                ChatRoomMemberEntity chatRoomMemberEntity =
                        chatRoomMemberRepository.findByRoomId(chatRoomEntity.get().getId()).get();
                return ChatRoomMemberDTO.toChatRoomMemberDTO(chatRoomMemberEntity);
            }
        }
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

    public List<ChatMessageDTO> chatLog(Long roomId){
        List<ChatMessageEntity> chatLogs= chatMessageRepository.chatLog(roomId);
        List<ChatMessageDTO> chatMessageDTOS = new ArrayList<>();
        for (ChatMessageEntity chat : chatLogs){
            chatMessageDTOS.add(ChatMessageDTO.toChatMessageDTO(chat));
        }
        return chatMessageDTOS;
    }

//    public void deleteRome(String room_id){
//        chatRoomRepository.deleteRoom(room_id);
//        chatRoomMemberRepository.deleteRoom(room_id);
//        chatMessageRepository.deleteLog(room_id);
//    }
//
//    public void deleteRome_Pw(String password, Long room_id){
//        if (chatRoomRepository.findByRoomId(room_id)).isPresent()){
//            if (password.equals(chatRoomRepository.getRoom(room_id).get().getRoomPassword())){
//                chatRoomRepository.deleteRoom(room_id);
//                chatRoomMemberRepository.deleteRoom(room_id);
//                chatMessageRepository.deleteLog(room_id);
//            }
//        }
//    }

    public void enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomEntity chatRoomEntity;  MemberEntity memberEntity;
        if (chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).isPresent() &&
                memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).isPresent()){
            chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).get();
            memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).get();

            ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                    .chatroom(chatRoomEntity)
                    .member(memberEntity)
                    .build();

            chatRoomMemberRepository.save(chatRoomMemberEntity);
        }
    }

    public void enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        ChatRoomEntity chatRoomEntity;  MemberEntity memberEntity;
        if (inputPw.equals(chatRoomMemberDTO.getChatroom().getRoomPassword())){
            if (chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).isPresent() &&
                    memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).isPresent()){
                chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).get();
                memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).get();

                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatRoomEntity)
                        .member(memberEntity)
                        .build();

                chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getChatroom().getId(),
                                                    chatRoomMemberEntity.getMember().getId(),
                                                    chatRoomMemberEntity.getRole());
            }
        }
        else return;
    }

    public void exitRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<ChatRoomEntity> chatRoomEntity =
                chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        if (chatRoomEntity.isPresent()){
            Optional<ChatRoomMemberEntity> chatRoomMemberEntity =
                    chatRoomMemberRepository.findByRoomId(chatRoomEntity.get().getId());
            chatRoomMemberEntity.ifPresent(roomMemberEntity -> chatRoomMemberRepository.deleteById(roomMemberEntity.getId()));
        }

    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }

//    public List<ChatRoomDTO> searchRoom(SearchDto searchDto){
//        List<ChatRoomMemberEntity> chatRoomList = new ArrayList<>();
//        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
//        if (searchDto.getType().equals("NAME")){
//            chatRoomList = chatRoomRepository.searchRoomName(searchDto.getKeyword());
//        }
//        else if (searchDto.getType().equals("MANAGER")){
//        }
////        else if (searchDto.getType().equals("TAG")){
////            List<ChatRoomHashtagEntity> chatRoomHashtagEntities = new ArrayList<>();
////            chatRoomHashtagEntities = chatRoomHashtagRepository.searchRoomTags(searchDto.getKeyword());
////        }
//
//        for (ChatRoomEntity chatRoom : chatRoomList){
//            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoom));
//        }
//
//        return chatRoomDTOList;
//    }

}
