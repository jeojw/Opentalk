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

    private final PersonalMessageRepository personalMessageRepository;

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
        Optional<MemberEntity> optionalManager = memberRepository.findByMemberNickName(managerChangeDto.getManager());
        Optional<MemberEntity> optionalNewManager = memberRepository.findByMemberNickName(managerChangeDto.getNewManager());
        Optional<ChatRoomEntity> optionalChatroom = chatRoomRepository.findByRoomId(managerChangeDto.getRoomId());
        if (optionalManager.isPresent() && optionalNewManager.isPresent() && optionalChatroom.isPresent()){
            MemberEntity manager = optionalManager.get();
            MemberEntity newManager = optionalNewManager.get();
            ChatRoomEntity chatroom = optionalChatroom.get();
            chatRoomMemberRepository.setManager(chatroom.getId(), newManager.getId());
            chatRoomMemberRepository.setParticipate(chatroom.getId(), manager.getId());
            chatRoomRepository.updateManager(chatroom.getRoomId(), newManager.getMemberNickName());

            return true;
        }
        return false;
    }

    public boolean changeRoomOption(ChatRoomRequestDto chatRoomRequestDto){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatRoomRequestDto.getRoomId());
        if (chatRoomEntity.isPresent()){
            ChatRoomEntity chatRoom = chatRoomEntity.get();
            String newPassword = "";
            if (!chatRoomRequestDto.getRoomPassword().isEmpty()){
                newPassword = passwordEncoder.encode(chatRoomRequestDto.getRoomPassword());
            }
            chatRoomRepository.changeRoomOption(chatRoomRequestDto.isExistLock(),
                    chatRoomRequestDto.getIntroduction(),
                    chatRoomRequestDto.getLimitParticipates(),
                    newPassword,
                    chatRoomRequestDto.getRoomName(),
                    chatRoomRequestDto.getRoomId());

            chatRoomHashtagRepository.deleteByChatroom(chatRoom.getId());

            for (HashTagDTO tag : chatRoomRequestDto.getRoomTags()){
                HashTagEntity tagEntity = HashTagEntity.toHashTagEntity(tag);
                Optional<HashTagEntity> existingTagOptional = hashTagRepository.getTagEntityByName(tagEntity.getName());
                if (existingTagOptional.isPresent()) {
                    tagEntity = existingTagOptional.get();
                } else {
                    hashTagRepository.save(tagEntity);
                }
                ChatRoomHashtagEntity roomHashtagEntity = ChatRoomHashtagEntity.builder()
                        .chatroom(chatRoom)
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
            ChatRoomEntity chatRoom = chatRoomEntity.get();
            MemberEntity member = memberEntity.get();
            chatMessageRepository.saveChat(chatRoom.getId(),
                    member.getId(),
                    chatMessageEntity.getTimeStamp(),
                    chatMessageEntity.getMessage());
        }
    }

    public List<ChatMessageDTO> chatLog(String roomId){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(roomId);

        if (chatRoomEntity.isPresent()){
            ChatRoomEntity chatRoom = chatRoomEntity.get();
            Optional<List<ChatMessageEntity>> optionalChatLogs= chatMessageRepository.chatLog(chatRoom.getId());
            List<ChatMessageDTO> chatMessageDTOS = new ArrayList<>();
            if (optionalChatLogs.isPresent()) {
                List<ChatMessageEntity> chatLogs = optionalChatLogs.get();
                for (ChatMessageEntity chat : chatLogs) {
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
            ChatRoomEntity chatRoom = chatRoomEntity.get();
            List<Optional<ChatRoomHashtagEntity>> chatRoomHashtagEntityList =
                    chatRoomHashtagRepository.findByRoomId(chatRoom.getId());
            List<Optional<String>> memberList = chatRoomMemberRepository.findMembers(chatRoom.getId());
            if (!memberList.isEmpty()){
                return "Fail";
            }
            else{
                for (Optional<ChatRoomHashtagEntity> room : chatRoomHashtagEntityList){
                    room.ifPresent(chatRoomHashtagRepository::delete);
                }
                chatMessageRepository.deleteLog(chatRoom.getId());
                chatRoomRepository.deleteById(chatRoom.getId());
                return "Success";
            }
        }
        return "Fail";
    }

    public String enterInvitedRoom(InviteDto inviteDto){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(inviteDto.getRoomId());
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberNickName(inviteDto.getInvitedMember());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            ChatRoomEntity chatRoom = chatRoomEntity.get();
            MemberEntity member = memberEntity.get();
            if (getParticipates(chatRoom.getRoomId()) < chatRoom.getLimitParticipates()){
                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatRoom)
                        .member(member)
                        .build();
                if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoom.getId(), member.getId()), BigInteger.ONE)){
                    chatRoomMemberRepository.deleteMember(chatRoom.getId(), member.getId());
                }
                chatRoomMemberRepository.save(chatRoomMemberEntity);
                Optional<InviteEntity> inviteEntity = inviteMessageRepository.getInviteMessage(inviteDto.getInviteId());
                if (inviteEntity.isPresent()){
                    InviteEntity invite = inviteEntity.get();
                    memberInviteRepository.deleteEntity(invite.getId(), member.getId());
                    inviteMessageRepository.deleteMessage(inviteDto.getInviteId());
                }
                return "Success";
            }
        }
        return "Fail";
    }

    public String enterRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<ChatRoomEntity> chatRoomEntity = chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity = memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            ChatRoomEntity chatroom = chatRoomEntity.get();
            MemberEntity member = memberEntity.get();
            if (getParticipates(chatroom.getRoomId()) != chatroom.getLimitParticipates()){
                ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                        .chatroom(chatroom)
                        .member(member)
                        .build();
                if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatroom.getId(), member.getId()), BigInteger.ONE)){
                    chatRoomMemberRepository.deleteMember(chatroom.getId(), member.getId());
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
                ChatRoomEntity chatroom = chatRoomEntity.get();
                MemberEntity member = memberEntity.get();
                if (getParticipates(chatroom.getRoomId()) != chatroom.getLimitParticipates()){
                    ChatRoomMemberEntity chatRoomMemberEntity = ChatRoomMemberEntity.builder()
                            .chatroom(chatroom)
                            .member(member)
                            .build();
                    if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatroom.getId(), member.getId()), BigInteger.ONE)){
                        chatRoomMemberRepository.deleteMember(chatroom.getId(), member.getId());
                    }
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

    public boolean exitRoom(ChatRoomMemberDTO chatRoomMemberDTO){
        Optional<ChatRoomEntity> chatRoomEntity =
                chatRoomRepository.getRoom(chatRoomMemberDTO.getChatroom().getRoomId());
        Optional<MemberEntity> memberEntity =
                memberRepository.findByMemberId(chatRoomMemberDTO.getMember().getMemberId());
        if (chatRoomEntity.isPresent() && memberEntity.isPresent()){
            Optional<ChatRoomMemberEntity> chatRoomMemberEntity =
                    chatRoomMemberRepository.findByRoomMemberId(chatRoomEntity.get().getId(), memberEntity.get().getId());
            chatRoomMemberEntity.ifPresent(roomMemberEntity -> chatRoomMemberRepository.deleteById(roomMemberEntity.getId()));
            return true;
        }
        return false;
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
        switch (searchDto.getType()) {
            case "title" -> chatRoomEntityList = chatRoomRepository.searchRoomsByTitle(searchDto.getKeyword());
            case "manager" -> chatRoomEntityList = chatRoomRepository.searchRoomsByManager(searchDto.getKeyword());
            case "tags" -> {
                Optional<Long> tagIdOptional = hashTagRepository.returnTagId(searchDto.getKeyword());
                if (tagIdOptional.isPresent()) {
                    List<Optional<Long>> chatroomList = chatRoomHashtagRepository.findByRoomTag(tagIdOptional.get());
                    for (Optional<Long> roomIdOptional : chatroomList) {
                        roomIdOptional.flatMap(chatRoomRepository::searchRoomsByTags).ifPresent(chatRoomEntityList::add);
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
        if (memberEntity.isPresent()){
            MemberEntity member = memberEntity.get();
            chatRoomMemberRepository.forcedExitRoom(member.getId());
            return true;
        }
        return false;
    }

    public boolean isExistInRoom(String roomId, String nickName){
        Optional<MemberEntity> optionalMember = memberRepository.findByMemberNickName(nickName);
        Optional<ChatRoomEntity> optionalRoom = chatRoomRepository.findByRoomId(roomId);
        if (optionalMember.isPresent() && optionalRoom.isPresent()){
            MemberEntity member = optionalMember.get();
            ChatRoomEntity room = optionalRoom.get();
            return Objects.equals(chatRoomMemberRepository.existByRoomMemberId(room.getId(), member.getId()), BigInteger.ONE);
        }
        return false;
    }

    public String InviteMember(InviteDto inviteDto){
        Optional<MemberEntity> optionalMember = memberRepository.findByMemberNickName(inviteDto.getInvitedMember());
        Optional<MemberEntity> optionalInviter = memberRepository.findByMemberNickName(inviteDto.getInviter());
        Optional<ChatRoomEntity> optionalChatRoom = chatRoomRepository.findByRoomId(inviteDto.getRoomId());
        if (optionalMember.isPresent() && optionalChatRoom.isPresent() && optionalInviter.isPresent()) {
            ChatRoomEntity chatRoom = optionalChatRoom.get();
            MemberEntity member = optionalMember.get();
            MemberEntity inviter = optionalInviter.get();
            if (Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoom.getId(),
                                                                            member.getId()), BigInteger.ONE) ||
                Objects.equals(inviteMessageRepository.isExistMessage(chatRoom.getRoomId(),
                                                        inviter.getMemberId(),
                                                        member.getMemberId()),
                                                        BigInteger.ONE)){
                return "Fail";
            }
            else {
                InviteEntity inviteEntity = InviteEntity.toInviteEntity(inviteDto);
                inviteMessageRepository.save(inviteEntity);
                memberInviteRepository.save(MemberInviteEntity.builder()
                        .member(member)
                        .message(inviteEntity)
                        .build());
                return "Success";
            }
        }
        return "Fail";
    }

    public void sendPMInRoom(PersonalMessageDto messageDto){
        PersonalMessageEntity personalMessageEntity = PersonalMessageEntity.builder()
                .messageId(messageDto.getMessageId())
                .receiver(messageDto.getReceiver())
                .caller(messageDto.getCaller())
                .message(messageDto.getMessage())
                .build();
        personalMessageRepository.save(personalMessageEntity);
    }

    public void deletePMInRoom(PersonalMessageDto messageDto){
        Optional<PersonalMessageEntity> message = personalMessageRepository.getMessage(messageDto.getMessageId());
        message.ifPresent(personalMessageRepository::delete);
    }
}
