package com.example.opentalk.service;

import com.example.opentalk.dto.*;
import com.example.opentalk.entity.*;
import com.example.opentalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomHashtagRepository chatRoomHashtagRepository;
    private final HashTagRepository hashTagRepository;

    private final InviteMessageRepository inviteMessageRepository;
    private final MemberInviteRepository memberInviteRepository;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        if (!chatRoomDTO.getRoomTags().isEmpty()) {
            ChatRoomHashtagEntity chatRoomHashtagEntity;

            List<String> hashTagList = hashTagRepository.findAllTags();
            ChatRoomEntity chatroomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
            chatRoomRepository.save(chatRoomEntity);

            Optional<Long> tag_id;
            for (HashTagDTO tag : chatRoomDTO.getRoomTags()) {
                if (!hashTagList.contains(tag.getTagName())) {
                    hashTagRepository.save(HashTagEntity.toHashTagEntity(tag));
                    tag_id = hashTagRepository.returnTagId(tag.getTagName());
                } else {
                    tag_id = hashTagRepository.returnTagId(tag.getTagName());
                    tag_id.ifPresent(hashTagRepository::accumulateTag);
                }
                Optional<ChatRoomEntity> chatroom = chatRoomRepository.findByRoomId(chatRoomEntity.getRoomId());
                if (chatroom.isPresent()) {
                    chatRoomHashtagEntity = ChatRoomHashtagEntity.builder()
                            .chatroom(chatRoomEntity)
                            .hashtag(HashTagEntity.toHashTagEntity(tag))
                            .build();
                    System.out.print("SaveTag_2!!!");
                    tag_id.ifPresent(aLong -> chatRoomHashtagRepository.SaveTagRoom(aLong, chatroom.get().getId()));
                }
            }
        }
        return chatRoomEntity.getRoomId();
    }

    public ChatRoomMemberDTO getRoomByRoomMember(String roomId, String memberId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(memberId);

        if (chatRoomEntity.isPresent() && memberEntity.isPresent()) {
            if (chatRoomMemberRepository.findByRoomMemberId(chatRoomEntity.get().getId(), memberEntity.get().getId()).isPresent()) {
                ChatRoomMemberEntity chatRoomMemberEntity =
                        chatRoomMemberRepository.findByRoomMemberId(chatRoomEntity.get().getId(),
                                                        memberEntity.get().getId()).get();
                return ChatRoomMemberDTO.toChatRoomMemberDTO(chatRoomMemberEntity);
            }
        }
        return null;
    }

    public ChatRoomDTO getRoomByRoom(String roomId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);

        return chatRoomEntity.map(ChatRoomDTO::toChatRoomDTO).orElse(null);
    }

    public int getParticipates(String roomId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);
        return chatRoomEntity.map(roomEntity -> chatRoomMemberRepository.getParticipates(roomEntity.getId())).orElse(-1);
    }

    public boolean authMandate(ManagerChangeDto managerChangeDto){
        Optional<MemberEntity> manager = memberRepository.findByMemberNickName(managerChangeDto.getManager());
        Optional<MemberEntity> newManager = memberRepository.findByMemberNickName(managerChangeDto.getNewManager());
        Optional<ChatRoomEntity> chatroom = chatRoomRepository.findByRoomId(managerChangeDto.getRoomId());
        if (manager.isPresent() && newManager.isPresent() && chatroom.isPresent()){
            chatRoomMemberRepository.setManager(chatroom.get().getId(), newManager.get().getId());
            chatRoomMemberRepository.setParticipate(chatroom.get().getId(), manager.get().getId());
           chatRoomRepository.updateManager(chatroom.get().getRoomId(), newManager.get().getMemberNickName());

            return true;
        }
        return false;
    }

    public boolean changeRoomOption(ChatRoomRequestDto chatRoomRequestDto){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatRoomRequestDto.getRoomId());
        System.out.print("Entity: " + chatRoomEntity);
        if (chatRoomEntity.isPresent()){
            ChatRoomHashtagEntity chatRoomHashtagEntity;
            chatRoomRepository.changeRoomOption(chatRoomRequestDto.isExistLock(),
                    chatRoomRequestDto.getIntroduction(),
                    chatRoomRequestDto.getLimitParticipates(),
                    chatRoomRequestDto.getRoomPassword(),
                    chatRoomRequestDto.getRoomName(),
                    chatRoomRequestDto.getRoomId());

            List<String> hastTagList = hashTagRepository.findAllTags();

            List<HashTagEntity> hashTagEntities = new ArrayList<>();
            for (HashTagDTO tag : chatRoomRequestDto.getRoomTags()){
                hashTagEntities.add(HashTagEntity.toHashTagEntity(tag));
            }

            for (HashTagEntity tagEntity : hashTagEntities){
                if (hastTagList.contains(tagEntity.getName())){
                    hashTagRepository.save(tagEntity);
                }
                else{
                    if (hashTagRepository.returnTagId(tagEntity.getName()).isPresent()) {
                        hashTagRepository.accumulateTag(hashTagRepository.returnTagId(tagEntity.getName()).get());
                    }
                }
                chatRoomHashtagEntity = ChatRoomHashtagEntity.builder()
                        .chatroom(chatRoomEntity.get())
                        .hashtag(tagEntity)
                        .build();
                chatRoomHashtagRepository.save(chatRoomHashtagEntity);
            }
            return true;
        }
        return false;
    }

    public boolean checkPassword(String roomId, String inputPassword){
        String roomPw = chatRoomRepository.existPassword(roomId);
        return inputPassword.equals(roomPw);
    }

    public void saveChat(ChatMessageDTO chatMessage){
        ChatMessageEntity chatMessageEntity = ChatMessageEntity.toChatMessageEntity(chatMessage);
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatMessageEntity.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(chatMessageEntity.getMember().getMemberId());

        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            chatMessageRepository.saveChat(chatRoomEntity.get().getId(),
                    memberEntity.get().getId(),
                    chatMessageEntity.getTimeStamp(),
                    chatMessageEntity.getMessage());
        }
    }

    public List<ChatMessageDTO> chatLog(String roomId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);

        if (chatRoomEntity.isPresent()){

            Optional<List<ChatMessageEntity>> chatLogs= chatMessageRepository.chatLog(chatRoomEntity.get().getId());
            List<ChatMessageDTO> chatMessageDTOS = new ArrayList<>();
            if (chatLogs.isPresent()) {
                for (ChatMessageEntity chat : chatLogs.get()) {
                    chatMessageDTOS.add(ChatMessageDTO.toChatMessageDTO(chat));
                }
                return chatMessageDTOS;
            }
        }
        return null;
    }

    public void deleteRome(String room_id){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(room_id);
        if (chatRoomEntity.isPresent()){
            Optional<ChatRoomMemberEntity> chatRoomMemberEntity =
                    chatRoomMemberRepository.findByRoomId(chatRoomEntity.get().getId());
            List<Optional<ChatRoomHashtagEntity>> chatRoomHashtagEntityList =
                    chatRoomHashtagRepository.findByRoomId(chatRoomEntity.get().getId());
            for (Optional<ChatRoomHashtagEntity> room : chatRoomHashtagEntityList){
                room.ifPresent(chatRoomHashtagRepository::delete);
            }
            chatRoomMemberEntity.ifPresent(roomMemberEntity -> chatRoomMemberRepository.deleteById(roomMemberEntity.getId()));
            chatMessageRepository.deleteLog(chatRoomEntity.get().getId());
            chatRoomRepository.deleteById(chatRoomEntity.get().getId());
        }

    }
    public boolean deleteRome_Pw(String room_id, String password){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(room_id);
        if (chatRoomEntity.isPresent()){
            if (password.equals(chatRoomEntity.get().getRoomPassword())){
                Optional<ChatRoomMemberEntity> chatRoomMemberEntity =
                        chatRoomMemberRepository.findByRoomId(chatRoomEntity.get().getId());
                List<Optional<ChatRoomHashtagEntity>> chatRoomHashtagEntityList =
                        chatRoomHashtagRepository.findByRoomId(chatRoomEntity.get().getId());
                for (Optional<ChatRoomHashtagEntity> room : chatRoomHashtagEntityList){
                    room.ifPresent(chatRoomHashtagRepository::delete);
                }
                chatRoomMemberEntity.ifPresent(roomMemberEntity -> chatRoomMemberRepository.deleteById(roomMemberEntity.getId()));
                chatMessageRepository.deleteLog(chatRoomEntity.get().getId());
                chatRoomRepository.deleteById(chatRoomEntity.get().getId());
                return true;
            }
        }
        return false;
    }

    public String enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        ChatRoomEntity chatRoomEntity;  MemberEntity memberEntity;
        if (chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).isPresent() &&
                memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).isPresent()){
            chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).get();
            memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).get();
            if (getParticipates(chatRoomEntity.getRoomId()) != chatRoomEntity.getLimitParticipates()){
                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatRoomEntity)
                        .member(memberEntity)
                        .build();
                if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoomEntity.getId(), memberEntity.getId()), BigInteger.ONE)){
                    chatRoomMemberRepository.deleteMember(chatRoomEntity.getId(), memberEntity.getId());
                }
                chatRoomMemberRepository.save(chatRoomMemberEntity);
                return "Success";
            }

        }
        return "Fail";
    }

    public String enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        ChatRoomEntity chatRoomEntity;  MemberEntity memberEntity;
        if (inputPw.equals(chatRoomMemberDTO.getChatroom().getRoomPassword())){
            if (chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).isPresent() &&
                    memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).isPresent()){
                chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId()).get();
                memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId()).get();
                if (getParticipates(chatRoomEntity.getRoomId()) != chatRoomEntity.getLimitParticipates()){
                    ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                            .chatroom(chatRoomEntity)
                            .member(memberEntity)
                            .build();

                    chatRoomMemberRepository.enterRoom(chatRoomMemberEntity.getChatroom().getId(),
                            chatRoomMemberEntity.getMember().getId(),
                            chatRoomMemberEntity.getRole());
                    return "Success";
                }
                else{
                    return "Fail";
                }
            }
        }
        else{
            return "Incorrect";
        }
        return "Fail";
    }

    public void exitRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<ChatRoomEntity> chatRoomEntity =
                chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity =
                memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            Optional<ChatRoomMemberEntity> chatRoomMemberEntity =
                    chatRoomMemberRepository.findByRoomMemberId(chatRoomEntity.get().getId(), memberEntity.get().getId());
            chatRoomMemberEntity.ifPresent(roomMemberEntity -> chatRoomMemberRepository.deleteById(roomMemberEntity.getId()));
        }

    }

    public List<ChatRoomDTO> findAllRooms(){
        List<ChatRoomEntity> chatRoomEntityList = chatRoomRepository.findAll();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
            ChatRoomDTO chatRoomDTO = ChatRoomDTO.toChatRoomDTO(chatRoomEntity);
            chatRoomDTO.setCurParticipates(getParticipates(chatRoomEntity.getRoomId()));
            chatRoomDTOList.add(chatRoomDTO);
        }
        return chatRoomDTOList;
    }

    public List<ChatRoomDTO> searchRooms(SearchDto searchDto){
        List<ChatRoomEntity> chatRoomEntityList = new ArrayList<>();
        List<ChatRoomDTO> chatRoomDTOList = new ArrayList<>();
        System.out.print("Type: " + searchDto.getType());
        if (searchDto.getType().equals("title")){
            chatRoomEntityList = chatRoomRepository.searchRoomsByTitle(searchDto.getKeyword());
            System.out.print("List:" + chatRoomEntityList);
        }
        else if (searchDto.getType().equals("manager")) {
            chatRoomEntityList = chatRoomRepository.searchRoomsByManager(searchDto.getKeyword());
        }
        else if (searchDto.getType().equals("tags")){
            Optional<Long> tag_id = hashTagRepository.returnTagId(searchDto.getKeyword());
            if (tag_id.isPresent()){
                List<Optional<Long>> chatroomList = chatRoomHashtagRepository.findByRoomTag(tag_id.get());
                for (Optional<Long> roomId : chatroomList){
                    if (roomId.isPresent()){
                        if (chatRoomRepository.searchRoomsByTags(roomId.get()).isPresent()) {
                            chatRoomEntityList.add(chatRoomRepository.searchRoomsByTags(roomId.get()).get());
                        }
                    }
                }
            }
        }

        if (!chatRoomEntityList.isEmpty()){
            for (ChatRoomEntity chatRoomEntity : chatRoomEntityList){
                chatRoomDTOList.add(ChatRoomDTO.toChatRoomDTO(chatRoomEntity));
            }
        }
        return chatRoomDTOList;
    }

    public boolean forcedExistRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        System.out.println(memberEntity);
        if (memberEntity.isPresent()){
            chatRoomMemberRepository.forcedExitRoom(memberEntity.get().getId());
            return true;
        }
        return false;
    }

    public boolean isExistInRoom(String roomId, String nickName){
        Optional<MemberEntity> member = memberRepository.findByMemberNickName(nickName);
        Optional<ChatRoomEntity> room = chatRoomRepository.findByRoomId(roomId);
        System.out.print("Optional:" + member.isPresent() +  room.isPresent());
        if (member.isPresent() && room.isPresent()){
            return Objects.equals(chatRoomMemberRepository.existByRoomMemberId(room.get().getId(), member.get().getId()), BigInteger.ONE);
        }
        return false;
    }

    public boolean InviteMember(InviteDto inviteDto){
        Optional<MemberEntity> member = memberRepository.findByMemberNickName(inviteDto.getInvitedMember());
        if (member.isPresent()){
            InviteEntity inviteEntity = InviteEntity.toInviteEntity(inviteDto);
            inviteMessageRepository.save(inviteEntity);
            memberInviteRepository.save(MemberInviteEntity.builder()
                            .member(member.get())
                            .message(inviteEntity)
                            .build());
            return true;
        }
        return false;
    }

    public void deleteInviteMessage(InviteDto inviteDto){

    }
}
