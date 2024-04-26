package com.example.opentalk.controller;

import com.example.opentalk.dto.*;
import com.example.opentalk.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RoomController {
    private final ChatRoomService chatRoomService;
    private final BCryptPasswordEncoder encoder;

    @GetMapping("/api/opentalk/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(){
        List<ChatRoomDTO> rooms = chatRoomService.findAllRooms();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(rooms);
    }

    @PostMapping("/api/opentalk/roomParticipates")
    public ResponseEntity<Integer> getParticipates(@RequestParam("roomId") String roomId){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.getParticipates(roomId));
    }

    @PostMapping("/api/opentalk/searchRooms")
    public ResponseEntity<List<ChatRoomDTO>> searchRooms(@RequestBody SearchDto searchDto){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.searchRooms(searchDto));
    }

    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestBody @Valid ChatRoomDTO chatRoomDTO){
        if (chatRoomDTO.isExistLock()){
            String encodePassword = encoder.encode(chatRoomDTO.getRoomPassword());
            chatRoomDTO.setRoomPassword(encodePassword);
        }
        String roomId = chatRoomService.createRoom(chatRoomDTO);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(roomId);
    }

    @PostMapping("/api/opentalk/invite")
    public ResponseEntity<Boolean> inviteMember(@RequestBody @Valid InviteDto inviteDto){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.InviteMember(inviteDto));
    }

    @PostMapping("/api/opentalk/authMandate")
    public ResponseEntity<Boolean> authMandate(@RequestBody @Valid  ManagerChangeDto managerChangeDto){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.authMandate(managerChangeDto));
    }

    @PostMapping("/api/opentalk/enterRoom")
    public ResponseEntity<String> enterRoom(@RequestBody @Valid ChatRoomMemberDTO chatRoomMemberDTO){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.enterRoom(chatRoomMemberDTO));
    }

    @PostMapping("/api/opentalk/enterInvitedRoom")
    public ResponseEntity<String> enterInvitedRoom(@RequestParam("roomId") String roomId,
                                                   @RequestParam("memberId") String memberId,
                                                   @RequestParam("inviter") String inviter){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.enterInvitedRoom(roomId, memberId, inviter));
    }

    @PostMapping("/api/opentalk/exitRoom")
    @CacheEvict(value="roomsCache", allEntries = true)
    public ResponseEntity<Boolean> exitRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.exitRoom(chatRoomMemberDTO));
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoomById(@PathVariable String roomId){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.getRoomByRoom(roomId));
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}/{memberId}")
    public ResponseEntity<ChatRoomMemberDTO> getRoomByRoomMemberId(@PathVariable String roomId, @PathVariable String memberId){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.getRoomByRoomMember(roomId, memberId));
    }

    @PostMapping("/api/opentalk/deleteRoom")
    public ResponseEntity<String> deleteRoom(@RequestParam("room_id") String room_id){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.deleteRoom(room_id));
    }

    @PostMapping("/api/opentalk/forcedExit")
    public ResponseEntity<Boolean> forced_Exit(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.forcedExistRoom(chatRoomMemberDTO));
    }

    @PostMapping("/api/opentalk/saveChat")
    public void saveChat(@RequestBody ChatMessageDTO chatMessageDTO){
        chatRoomService.saveChat(chatMessageDTO);
    }

    @PostMapping("/api/opentalk/chatLog")
    public ResponseEntity<List<ChatMessageDTO>> chatLog(@RequestParam("roomId") String roomId){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.chatLog(roomId));
    }

    @PostMapping("/api/opentalk/enterRoom/{password}")
    public ResponseEntity<String> enterRoom_Pw(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO, @PathVariable String password){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.enterRoom_Pw(chatRoomMemberDTO, password));
    }

    @PostMapping("/api/opentalk/changeRoom")
    public ResponseEntity<Boolean> changRoom(@RequestBody @Valid ChatRoomRequestDto chatRoomRequestDto){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.changeRoomOption(chatRoomRequestDto));
    }

    @GetMapping("/api/opentalk/isExistInRoom/{roomId}/{memberId}")
    public ResponseEntity<Boolean> isExistInRoom(@PathVariable String roomId, @PathVariable String memberId){
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache())
                .body(chatRoomService.isExistInRoom(roomId, memberId));
    }

}
