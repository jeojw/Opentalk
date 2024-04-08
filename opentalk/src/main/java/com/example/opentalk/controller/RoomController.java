package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatMessageDTO;
import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RoomController {
    private final ChatRoomService chatRoomService;

    @GetMapping("/api/opentalk/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(){
        List<ChatRoomDTO> rooms = chatRoomService.findAllRooms();
        System.out.println(rooms); // 결과 출력
        return ResponseEntity.ok(rooms);
    }
    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestBody @Valid ChatRoomDTO chatRoomDTO){
        chatRoomDTO.setRoomId(UUID.randomUUID().toString());
        String roomId = chatRoomService.createRoom(chatRoomDTO);
        return ResponseEntity.ok(roomId);
    }

    @Transactional
    @PostMapping("/api/opentalk/enterRoom")
    public void enterRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        System.out.print("MemberId:" + chatRoomMemberDTO.getMember().getMemberId());
        chatRoomService.enterRoom(chatRoomMemberDTO);
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoom(@PathVariable String roomId){
        return ResponseEntity.ok(chatRoomService.getRoom(roomId));
    }

    @PostMapping("/api/opentalk/changeRoom")
    public void changeRoom(@RequestBody ChatRoomDTO chatRoomDTO){

    }

    @PostMapping("/api/opentalk/deleteRoom")
    public void deleteRoom(@RequestParam("room_id") String room_id){
        chatRoomService.deleteRome(room_id);
    }

    @PostMapping("/api/opentalk/deleteRoom/password")
    public void deleteRoom_Pw(@RequestParam("room_id") String room_id, @RequestParam("password") String password){
        chatRoomService.deleteRome_Pw(room_id, password);
    }

    @PostMapping("/api/opentalk/saveChat")
    public void saveChat(@RequestBody ChatMessageDTO chatMessageDTO){
        chatRoomService.saveChat(chatMessageDTO);
    }

    @PostMapping("/api/opentalk/chatLog")
    public ResponseEntity<List<ChatMessageDTO>> chatLog(@RequestParam("roomId") String roomId){
        return ResponseEntity.ok(chatRoomService.chatLog(roomId));
    }

    @PostMapping("/api/opentalk/enterRoom/{password}")
    public void enterRoom_Pw(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO, @PathVariable String password){
        chatRoomService.enterRoom_Pw(chatRoomMemberDTO, password);
    }

    @PostMapping("/api/opentalk/exitRoom")
    public void exitRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        chatRoomService.exitRoom(chatRoomMemberDTO.getChatroom().getRoomId(),
                chatRoomMemberDTO.getMember().getMemberId());
    }

}
