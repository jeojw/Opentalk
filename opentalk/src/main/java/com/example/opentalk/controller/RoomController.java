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

    @PostMapping("/api/opentalk/searchRooms")
    public ResponseEntity<List<ChatRoomDTO>> searchRooms(@RequestBody SearchDto searchDto){
        return ResponseEntity.ok(chatRoomService.searchRooms(searchDto));
    }

    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestBody @Valid ChatRoomDTO chatRoomDTO){
        String roomId = chatRoomService.createRoom(chatRoomDTO);
        return ResponseEntity.ok(roomId);
    }

    @PostMapping("/api/opentalk/enterRoom")
    public void enterRoom(@RequestBody @Valid ChatRoomMemberDTO chatRoomMemberDTO){
        chatRoomService.enterRoom(chatRoomMemberDTO);
    }

    @PostMapping("/api/opentalk/exitRoom")
    public void exitRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        chatRoomService.exitRoom(chatRoomMemberDTO);
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}/{memberId}")
    public ResponseEntity<ChatRoomMemberDTO> getRoom(@PathVariable String roomId, @PathVariable String memberId){
        return ResponseEntity.ok(chatRoomService.getRoom(roomId, memberId));
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
    public ResponseEntity<Boolean> forced_Exit(@RequestBody MemberResponseDto memberResponseDto){
        return ResponseEntity.ok(chatRoomService.forcedExistRoom(memberResponseDto));
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
    public ResponseEntity<Boolean> enterRoom_Pw(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO, @PathVariable String password){
        return ResponseEntity.ok(chatRoomService.enterRoom_Pw(chatRoomMemberDTO, password));
    }

    @PostMapping("/api/opentalk/changeRoom")
    public ResponseEntity<Boolean> changRoom(@RequestBody @Valid ChatRoomRequestDto chatRoomRequestDto){
        return ResponseEntity.ok(chatRoomService.changeRoomOption(chatRoomRequestDto));
    }

}
