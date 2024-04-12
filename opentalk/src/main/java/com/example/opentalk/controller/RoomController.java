package com.example.opentalk.controller;

import com.example.opentalk.dto.*;
import com.example.opentalk.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RoomController {
    private final ChatRoomService chatRoomService;

    @GetMapping("/api/opentalk/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(){
        List<ChatRoomDTO> rooms = chatRoomService.findAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/api/opentalk/roomParticipates")
    public ResponseEntity<Integer> getParticipates(@RequestParam("roomId") String roomId){
        return ResponseEntity.ok(chatRoomService.getParticipates(roomId));
    }

    @PostMapping("/api/opentalk/searchRooms")
    public ResponseEntity<List<ChatRoomDTO>> searchRooms(@RequestBody SearchDto searchDto){
        return ResponseEntity.ok(chatRoomService.searchRooms(searchDto));
    }

    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestBody @Valid ChatRoomDTO chatRoomDTO){
        String roomId = chatRoomService.createRoom(chatRoomDTO);
        return ResponseEntity.ok(roomId);
    }

//    @PostMapping("/api/opentalk/invite")
//    public ResponseEntity<Boolean> inviteMember(@RequestParam("nickName") String nickName){
//
//    }

    @PostMapping("/api/opentalk/authMandate")
    public ResponseEntity<Boolean> authMandate(@RequestBody @Valid  ManagerChangeDto managerChangeDto){
        return ResponseEntity.ok(chatRoomService.authMandate(managerChangeDto));
    }

    @PostMapping("/api/opentalk/enterRoom")
    public ResponseEntity<String> enterRoom(@RequestBody @Valid ChatRoomMemberDTO chatRoomMemberDTO){
        return ResponseEntity.ok(chatRoomService.enterRoom(chatRoomMemberDTO));
    }

    @PostMapping("/api/opentalk/exitRoom")
    public void exitRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        chatRoomService.exitRoom(chatRoomMemberDTO);
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoomById(@PathVariable String roomId){
        return ResponseEntity.ok(chatRoomService.getRoomByRoom(roomId));
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}/{memberId}")
    public ResponseEntity<ChatRoomMemberDTO> getRoomByRoomMemberId(@PathVariable String roomId, @PathVariable String memberId){
        return ResponseEntity.ok(chatRoomService.getRoomByRoomMember(roomId, memberId));
    }

    @PostMapping("/api/opentalk/deleteRoom")
    public void deleteRoom(@RequestParam("room_id") String room_id){
        chatRoomService.deleteRome(room_id);
    }

    @PostMapping("/api/opentalk/deleteRoom/{password}")
    public ResponseEntity<Boolean> deleteRoom_Pw(@RequestParam("room_id") String room_id, @PathVariable String password){
        return ResponseEntity.ok(chatRoomService.deleteRome_Pw(room_id, password));
    }

    @PostMapping("/api/opentalk/forcedExit")
    public ResponseEntity<Boolean> forced_Exit(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        return ResponseEntity.ok(chatRoomService.forcedExistRoom(chatRoomMemberDTO));
    }

//    @PostMapping("/api/opentalk/searchRoom")
//    public ResponseEntity<List<ChatRoomDTO>> searchRoom(@RequestBody SearchDto searchDto){
//        return ResponseEntity.ok(chatRoomService.searchRoom(searchDto));
//    }

    @PostMapping("/api/opentalk/saveChat")
    public void saveChat(@RequestBody ChatMessageDTO chatMessageDTO){
        chatRoomService.saveChat(chatMessageDTO);
    }

    @PostMapping("/api/opentalk/chatLog")
    public ResponseEntity<List<ChatMessageDTO>> chatLog(@RequestParam("roomId") String roomId){
        return ResponseEntity.ok(chatRoomService.chatLog(roomId));
    }

    @PostMapping("/api/opentalk/enterRoom/{password}")
    public ResponseEntity<String> enterRoom_Pw(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO, @PathVariable String password){
        return ResponseEntity.ok(chatRoomService.enterRoom_Pw(chatRoomMemberDTO, password));
    }

    @PostMapping("/api/opentalk/changeRoom")
    public ResponseEntity<Boolean> changRoom(@RequestBody @Valid ChatRoomRequestDto chatRoomRequestDto){
        return ResponseEntity.ok(chatRoomService.changeRoomOption(chatRoomRequestDto));
    }

    @GetMapping("/api/opentalk/isExistInRoom/{roomId}/{memberId}")
    public ResponseEntity<Boolean> isExistInRoom(@PathVariable String roomId, @PathVariable String memberId){
        return ResponseEntity.ok(chatRoomService.isExistInRoom(roomId, memberId));
    }

}
