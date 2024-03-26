package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
public class RoomController {
    private final ChatRoomRepository repository;

    @PostMapping("/api/opentalk/rooms")
    public ResponseEntity<List<ChatRoomDTO>> rooms(){
        log.info("# All Chat Rooms");

        return ResponseEntity.ok(repository.findAllRooms());
    }

    @PostMapping("/api/opentalk/room")
    public ResponseEntity<String> create(@RequestParam("name") String name, @RequestParam("password") String password,
                                         @RequestParam("manager") String manager, @RequestParam("count") Integer count){
        log.info("# Create Chat Room, name: " + name);
        repository.createChatRoomDTO(name, password, manager, count);
        return ResponseEntity.ok("rooms");
    }

    @GetMapping("/api/opentalk/room")
    public void getRoom(String roomId, Model model){
        log.info("# get Chat Room, roomID: " + roomId);
        model.addAttribute("room", repository.findRoomById(roomId));
    }
}
