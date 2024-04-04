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
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomService {
    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final HashTagRepository hashTagRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;

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

    public void enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getId(),
                chatRoomMemberEntity.getChatroom().getRoomId(),
                chatRoomMemberEntity.getMember().getMemberId());
        chatRoomRepository.enterRoom(chatRoomMemberEntity.getChatroom().getRoomId());
    }

    public void enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.toChatRoomMemberEntity(chatRoomMemberDTO);
        System.out.print(inputPw);
        if (inputPw.equals(chatRoomMemberEntity.getChatroom().getRoomPassword())){
            chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getId(),
                    chatRoomMemberEntity.getChatroom().getRoomId(),
                    chatRoomMemberEntity.getMember().getMemberId());
            chatRoomRepository.enterRoom(chatRoomMemberEntity.getChatroom().getRoomId());
        }
        else return;
    }

    public void exitRoom(String room_id, String member_id){
        ChatRoomMemberEntity chatRoomMemberEntity = chatRoomMemberRepository.findMember(room_id, member_id);

        chatRoomMemberRepository.exitRoom(chatRoomMemberEntity.getChatroom().getRoomId(),
                                            chatRoomMemberEntity.getMember().getMemberId());
        chatRoomRepository.exitRoom(chatRoomMemberEntity.getChatroom().getRoomId());
    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
        }
        return chatRoomDTOList;
    }

    public MemberDTO findMyself(String memberId){
        return MemberDTO.toMemberDTO_Op(memberRepository.findByMemberId(memberId));
    }

    public List<MemberDTO> findMembers(String roomId){
        List<Optional<MemberEntity>> members = new ArrayList<>();
        List<MemberDTO> memberDTOList = new ArrayList<>();
        List<String> member_id = chatRoomMemberRepository.findMembers(roomId);
        for (String id : member_id){
            members.add(memberRepository.findByMemberId(id));
        }
        for (Optional<MemberEntity> me : members){
            System.out.print(MemberDTO.toMemberDTO_Op(me));
            memberDTOList.add(MemberDTO.toMemberDTO_Op(me));
        }

        return memberDTOList;
    }


    public void deleteRoom(String roomId){

    }
}