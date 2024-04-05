package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/api/opentalk/enterRoom/")
    public void enterRoom(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO){
        chatRoomService.enterRoom(chatRoomMemberDTO);
    }

    @GetMapping("/api/opentalk/getRoom/{roomId}")
    public ResponseEntity<ChatRoomDTO> getRoom(@PathVariable String roomId){
        return ResponseEntity.ok(chatRoomService.getRoom(roomId));
    }


    @PostMapping("/api/opentalk/enterRoom/{password}")
    public void enterRoom_Pw(@RequestBody ChatRoomMemberDTO chatRoomMemberDTO, @PathVariable String password){
        chatRoomService.enterRoom_Pw(chatRoomMemberDTO, password);
    }

//    @PostMapping("/api/opentalk/exitRoom")
//    public void exitRoom(@RequestParam("chatroom") ChatRoomDTO chatroom, @RequestParam("member")ChatMemberDto member){
//        chatRoomService.exitRoom(chatRoomMemberDTO.getChatroom().getRoomId(),
//                chatRoomMemberDTO.getMember().getMemberId());
//    }

//    @PostMapping("/api/opentalk/appendTag")
//    public ResponseEntity<HashTagDTO> createTag(@RequestBody @Valid HashTagDTO hashTagDTO){
//
//    }
}
