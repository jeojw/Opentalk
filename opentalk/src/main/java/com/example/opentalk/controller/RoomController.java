package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.repository.ChatRoomRepository;
import com.example.opentalk.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RoomController {
    private final ChatRoomService chatRoomService;

    @GetMapping("/api/opentalk/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(){
        return ResponseEntity.ok(chatRoomService.findAll());
    }
    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestBody @Valid ChatRoomDTO chatRoomDTO){
        String roomId = chatRoomService.createRoom(chatRoomDTO);
        return ResponseEntity.ok(roomId);
    }
}
