package com.example.opentalk.controller;

import com.example.opentalk.dto.ChangePasswordRequestDto;
import com.example.opentalk.dto.MemberRequestDto;
import com.example.opentalk.dto.MemberResponseDto;
import com.example.opentalk.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/api/opentalk/member/me")
    public ResponseEntity<MemberResponseDto> getMyMemberInfo() {
        MemberResponseDto myInfoBySecurity = memberService.getMyInfoBySecurity();
        System.out.println(myInfoBySecurity.getMemberNickName());
        return ResponseEntity.ok((myInfoBySecurity));
        // return ResponseEntity.ok(memberService.getMyInfoBySecurity());
    }

    @PostMapping("/api/opentalk/member/findId")
    public ResponseEntity<String> findMemberId(@RequestParam("memberEmail") String memberEmail){
        return ResponseEntity.ok(memberService.findMemberId(memberEmail));
    }


    @PostMapping("/api/opentalk/member/authId")
    public ResponseEntity<Boolean> authId(@RequestParam("memberId") String memberId){
        return ResponseEntity.ok(memberService.existId(memberId));
    }

    @PostMapping("/api/opentalk/member/getExPassword")
    public ResponseEntity<String> getExPassword(@RequestParam("memberEmail") String memberEmail){
        return ResponseEntity.ok(memberService.getExPw(memberEmail));
    }

    @PostMapping("/api/opentalk/member/changeNickname")
    public ResponseEntity<MemberResponseDto> setMemberNickname(@RequestBody MemberRequestDto request) {
        return ResponseEntity.ok(memberService.changeMemberNickname(request.getMemberId(), request.getMemberNickName()));
    }

    @PostMapping("/api/opentalk/member/changePassword")
    public ResponseEntity<MemberResponseDto> setMemberPassword(@RequestBody ChangePasswordRequestDto request) {
        return ResponseEntity.ok(memberService.changeMemberPassword(request.getExPassword(), request.getNewPassword()));
    }
}
