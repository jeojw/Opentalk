package com.example.opentalk;

import com.example.opentalk.controller.RoomController;
import com.example.opentalk.dto.ChatRoomDTO;
import com.example.opentalk.dto.ChatRoomMemberDTO;
import com.example.opentalk.service.ChatRoomService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest
public class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private ChatRoomService chatRoomService;

    @InjectMocks
    private RoomController roomController;

    private ChatRoomDTO chatRoomDTO;

    @BeforeEach
    void setUp() {
        // Mock data
        chatRoomDTO = new ChatRoomDTO();
        chatRoomDTO.setRoomId(UUID.randomUUID().toString());
        chatRoomDTO.setManager("managerId");
        chatRoomDTO.setRoomName("Room 1");
        chatRoomDTO.setExistLock(false);
        chatRoomDTO.setRoomPassword("");
        chatRoomDTO.setIntroduction("This is a test room");
        chatRoomDTO.setLimitParticipates(10);
        chatRoomDTO.setParticipates(0);
        chatRoomDTO.setRoomTags(new ArrayList<>());
        chatRoomDTO.setMembers(new ArrayList<>());
    }

    @Test
    public void testGetRooms() throws Exception {
        List<ChatRoomDTO> roomList = new ArrayList<>();
        roomList.add(chatRoomDTO);

        // Mock service method
        when(chatRoomService.findAllRooms()).thenReturn(roomList);

        // Perform GET request
        mockMvc.perform(MockMvcRequestBuilders.get("/api/opentalk/rooms"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.size()").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].roomId").value(chatRoomDTO.getRoomId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].roomName").value(chatRoomDTO.getRoomName()))
                .andDo(print());
    }

    @Test
    public void testCreate() throws Exception {
        // Mock service method
        when(chatRoomService.createRoom(chatRoomDTO)).thenReturn(chatRoomDTO.getRoomId());

        // Perform POST request
        mockMvc.perform(MockMvcRequestBuilders.post("/api/opentalk/makeRoom")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJsonString(chatRoomDTO))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.content().string(chatRoomDTO.getRoomId()))
                .andDo(print());
    }

    @Test
    public void testEnterRoom() throws Exception {
        // Perform POST request
        mockMvc.perform(MockMvcRequestBuilders.post("/api/opentalk/enterRoom/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJsonString(new ChatRoomMemberDTO()))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // Verify service method is called with correct argument
        verify(chatRoomService, times(1)).enterRoom(any());
    }

    @Test
    public void testGetRoom() throws Exception {
        // Mock service method
        when(chatRoomService.getRoom(chatRoomDTO.getRoomId())).thenReturn(chatRoomDTO);

        // Perform GET request
        mockMvc.perform(MockMvcRequestBuilders.get("/api/opentalk/getRoom/{roomId}", chatRoomDTO.getRoomId()))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.roomId").value(chatRoomDTO.getRoomId()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.roomName").value(chatRoomDTO.getRoomName()))
                .andDo(print());
    }

    @Test
    public void testEnterRoom_Pw() throws Exception {
        // Perform POST request
        mockMvc.perform(MockMvcRequestBuilders.post("/api/opentalk/enterRoom/{password}", "1234")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJsonString(new ChatRoomMemberDTO()))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // Verify service method is called with correct argument
        verify(chatRoomService, times(1)).enterRoom_Pw(any(), eq("1234"));
    }

    // Helper method to convert object to JSON string
    public static String asJsonString(final Object obj) throws JsonProcessingException {
        return new ObjectMapper().writeValueAsString(obj);
    }
}
