package com.example.opentalk.service;

import com.example.opentalk.dto.*;
import com.example.opentalk.entity.*;
import com.example.opentalk.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomHashtagRepository chatRoomHashtagRepository;
    private final HashTagRepository hashTagRepository;

    private final InviteMessageRepository inviteMessageRepository;
    private final MemberInviteRepository memberInviteRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public String createRoom(ChatRoomDTO chatRoomDTO){
        ChatRoomEntity chatRoomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        ChatRoomHashtagEntity chatRoomHashtagEntity;

        List<String> hashTagList = hashTagRepository.findAllTags();
        ChatRoomEntity chatroomEntity = ChatRoomEntity.toChatRoomEntity(chatRoomDTO);
        chatRoomRepository.save(chatRoomEntity);
        if (!chatRoomDTO.getRoomTags().isEmpty()) {
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
                ChatRoomMemberDTO chatRoomMember = ChatRoomMemberDTO.toChatRoomMemberDTO(chatRoomMemberEntity);
                chatRoomMember.getChatroom().setCurParticipates(getParticipates(roomId));
                return chatRoomMember;
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
        if (chatRoomEntity.isPresent()){

            chatRoomRepository.changeRoomOption(chatRoomRequestDto.isExistLock(),
                    chatRoomRequestDto.getIntroduction(),
                    chatRoomRequestDto.getLimitParticipates(),
                    passwordEncoder.encode(chatRoomRequestDto.getRoomPassword()),
                    chatRoomRequestDto.getRoomName(),
                    chatRoomRequestDto.getRoomId());

            chatRoomHashtagRepository.deleteByChatroom(chatRoomEntity.get().getId());

            for (HashTagDTO tag : chatRoomRequestDto.getRoomTags()){
                HashTagEntity tagEntity = HashTagEntity.toHashTagEntity(tag);
                Optional<HashTagEntity> existingTagOptional = hashTagRepository.getTagEntityByName(tagEntity.getName());
                if (existingTagOptional.isPresent()) {
                    tagEntity = existingTagOptional.get();
                } else {
                    hashTagRepository.save(tagEntity);
                }
                ChatRoomHashtagEntity roomHashtagEntity = ChatRoomHashtagEntity.builder()
                        .chatroom(chatRoomEntity.get())
                        .hashtag(tagEntity)
                        .build();
                chatRoomHashtagRepository.save(roomHashtagEntity);
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

    public String deleteRoom(String room_id){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(room_id);
        if (chatRoomEntity.isPresent()){
            List<Optional<ChatRoomHashtagEntity>> chatRoomHashtagEntityList =
                    chatRoomHashtagRepository.findByRoomId(chatRoomEntity.get().getId());
            List<Optional<String>> memberList = chatRoomMemberRepository.findMembers(chatRoomEntity.get().getId());
            if (!memberList.isEmpty()){
                return "Fail";
            }
            else{
                for (Optional<ChatRoomHashtagEntity> room : chatRoomHashtagEntityList){
                    room.ifPresent(chatRoomHashtagRepository::delete);
                }
                chatMessageRepository.deleteLog(chatRoomEntity.get().getId());
                chatRoomRepository.deleteById(chatRoomEntity.get().getId());
                return "Success";
            }
        }
        return "Fail";
    }

    public String enterInvitedRoom(String roomId, String memberId, String inviter){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(memberId);
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            if (getParticipates(chatRoomEntity.get().getRoomId()) != chatRoomEntity.get().getLimitParticipates()){
                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatRoomEntity.get())
                        .member(memberEntity.get())
                        .build();
                if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoomEntity.get().getId(), memberEntity.get().getId()), BigInteger.ONE)){
                    chatRoomMemberRepository.deleteMember(chatRoomEntity.get().getId(), memberEntity.get().getId());
                }
                chatRoomMemberRepository.save(chatRoomMemberEntity);
                Optional<InviteEntity> inviteEntity = inviteMessageRepository.getInviteMessage(inviter, memberEntity.get().getMemberNickName());
                if (inviteEntity.isPresent()){
                    memberInviteRepository.deleteEntity(inviteEntity.get().getId(), memberEntity.get().getId());
                    inviteMessageRepository.deleteMessage(memberEntity.get().getMemberNickName(), inviter);
                    return "Success";
                }
            }
        }
        return "Fail";
    }

    public String enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            if (getParticipates(chatRoomEntity.get().getRoomId()) != chatRoomEntity.get().getLimitParticipates()){
                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatRoomEntity.get())
                        .member(memberEntity.get())
                        .build();
                if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoomEntity.get().getId(), memberEntity.get().getId()), BigInteger.ONE)){
                    chatRoomMemberRepository.deleteMember(chatRoomEntity.get().getId(), memberEntity.get().getId());
                }
                chatRoomMemberRepository.save(chatRoomMemberEntity);
                return "Success";
            }

        }
        return "Fail";
    }

    public String enterRoom_Pw(ChatRoomMemberDTO chatRoomMemberDTO, String inputPw){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            if (passwordEncoder.matches(inputPw, chatRoomEntity.get().getRoomPassword())){
                if (getParticipates(chatRoomEntity.get().getRoomId()) != chatRoomEntity.get().getLimitParticipates()){
                    ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                            .chatroom(chatRoomEntity.get())
                            .member(memberEntity.get())
                            .build();

                    chatRoomMemberRepository.save(chatRoomMemberEntity);
                    return "Success";
                }
                else{
                    return "Fail";
                }
            }
            else{
                return "Incorrect";
            }
        }
        else{
            return "Fail";
        }
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
                ChatRoomDTO chatRoomDTO = ChatRoomDTO.toChatRoomDTO(chatRoomEntity);
                chatRoomDTO.setCurParticipates(getParticipates(chatRoomEntity.getRoomId()));
                chatRoomDTOList.add(chatRoomDTO);
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
