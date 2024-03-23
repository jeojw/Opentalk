package com.example.opentalk.controller;


import com.example.opentalk.dto.EmailCheckDto;
import com.example.opentalk.dto.EmailRequestDTO;
import com.example.opentalk.dto.MemberDTO;
import com.example.opentalk.service.MailSendService;
import com.example.opentalk.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
public class MailController {
    private final MailSendService mailService;

    @GetMapping("/api/opentalk/enroll/mailSend")
    public String mailSendForm(){
        return "mailSend";
    }
    @PostMapping("/api/opentalk/enroll/mailSend")
    public String mailSend(@RequestBody @Valid EmailRequestDTO emailDto) {
        System.out.println("이메일 인증 요청이 들어옴");
        System.out.println("이메일 인증 이메일 :" + emailDto.getEmail());
        return mailService.joinEmail(emailDto.getEmail());
    }

    @PostMapping("/api/opentalk/enroll/mailauthCheck")
    public String AuthCheck(@RequestBody @Valid EmailCheckDto emailCheckDto) {
        boolean Checked = mailService.CheckAuthNum(emailCheckDto.getEmail(), emailCheckDto.getAuthNum());
        if (Checked) {
            return "ok";
        } else {
            throw new NullPointerException("뭔가 잘못!");
        }
    }
}

