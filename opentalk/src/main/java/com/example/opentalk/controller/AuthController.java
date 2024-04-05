package com.example.opentalk.controller;

import com.example.opentalk.dto.MemberRequestDto;
import com.example.opentalk.dto.MemberResponseDto;
import com.example.opentalk.dto.TokenDto;
import com.example.opentalk.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/api/opentalk/member/signup")
    public ResponseEntity<MemberResponseDto> signup(@RequestBody MemberRequestDto memberRequestDto){
        return ResponseEntity.ok(authService.signup(memberRequestDto));
    }

    @PostMapping("/api/opentalk/signup/checkId")
    public ResponseEntity<Boolean> checkDuplicateId(@RequestParam("memberId") String memberId){
        return ResponseEntity.ok(authService.checkDuplicateId(memberId));
    }

    @PostMapping("/api/opentalk/signup/checkNickName")
    public ResponseEntity<Boolean> checkDuplicateNickName(@RequestParam("memberNickName") String memberNickName){
        return ResponseEntity.ok(authService.checkDuplicateNickName(memberNickName));
    }

    @PostMapping("/api/opentalk/signup/checkEmail")
    public ResponseEntity<Boolean> checkDuplicateEmail(@RequestParam("memberEmail") String memberEmail){
        return ResponseEntity.ok(authService.checkDuplicateEmail(memberEmail));
    }

    @PostMapping("/api/opentalk/member/login")
    public ResponseEntity<TokenDto> login(@RequestBody MemberRequestDto requestDto) {
        return ResponseEntity.ok(authService.login(requestDto));
    }
}
