package com.example.opentalk.controller;

import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
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
    @PostMapping("/api/opentalk/makeRoom")
    public ResponseEntity<String> create(@RequestParam("name") String name, @RequestParam("password") String password,
                                         @RequestParam("manager") String manager, @RequestParam("count") Integer count,
                                         @RequestParam("info") String info, @RequestParam("tags") List<String> tags){
        log.info("# Create Chat Room, name: " + name);
        List<HashTagDTO> tagList = new ArrayList<>();
        for (String tag : tags){
            tagList.add(HashTagDTO.create(tag));
        }
        String roomId = repository.createChatRoomDTO(name, password, manager, count, info, tagList);
        return ResponseEntity.ok(roomId);
    }

    @GetMapping("/api/opentalk/room")
    public void getRoom(String roomId, Model model){
        log.info("# get Chat Room, roomID: " + roomId);
        model.addAttribute("room", repository.findRoomById(roomId));
    }
}
