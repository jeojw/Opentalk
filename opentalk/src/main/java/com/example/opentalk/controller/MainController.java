package com.example.opentalk.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MainController {
    @GetMapping("/api/opentalk/main")
    public String MainFrom(){
        return "main";
    }

    @RequestMapping(value="front", method= RequestMethod.GET)
    public String logout(HttpServletRequest request) throws  Exception{
        HttpSession session = request.getSession();
        session.invalidate();

        return "redirect:/opentalk/front";
    }
}
