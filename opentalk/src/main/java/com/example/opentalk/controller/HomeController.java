package com.example.opentalk.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/opentalk/front")
    public String FrontPage(){
        return "FrontPage";
    }

}
