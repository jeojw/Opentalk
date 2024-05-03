package com.example.opentalk.controller;

import com.example.opentalk.RuntimeException;
import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.dto.InviteDto;
import com.example.opentalk.dto.PersonalMessageDto;
import com.example.opentalk.service.AuthService;
import com.example.opentalk.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final AuthService authService;

    @GetMapping("/api/opentalk/member/me")
    public ResponseEntity<AuthDto.ResponseDto> getMyMemberInfo(@RequestHeader("Authorization") String authorizationHeader) throws RuntimeException {
        String token = authorizationHeader.substring("Bearer ".length());
        AuthDto.ResponseDto myInfoBySecurity = authService.getMyInfo(token);
        return ResponseEntity.ok(myInfoBySecurity);
    }

    @PostMapping("/api/opentalk/member/changeImg")
    public ResponseEntity<Boolean> changeImg(@RequestParam("memberId") String memberId, @RequestPart("newImg") MultipartFile newImg) throws IOException {
        // 이미지가 엔티티에 저장되었으므로 엔티티를 저장
        return ResponseEntity.ok(memberService.changeImage(memberId, newImg));
    }

    @PostMapping("/api/opentalk/member/searchNickNameInRoom")
    public ResponseEntity<List<AuthDto.ResponseDto>> searchMember(@RequestParam("roomId") String roomId, @RequestParam("nickName") String nickName){
        return ResponseEntity.ok(memberService.searchMemberInRoom(roomId, nickName));
    }

    @PostMapping("/api/opentalk/member/searchNickNameInMain")
    public ResponseEntity<List<AuthDto.ResponseDto>> searchMember(@RequestParam("nickName") String nickName){
        return ResponseEntity.ok(memberService.searchMemberInMain(nickName));
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
    public ResponseEntity<AuthDto.ResponseDto> setMemberNickname(@RequestBody AuthDto.ResponseDto memberResponseDto) {
        return ResponseEntity.ok(memberService.changeMemberNickname(memberResponseDto.getMemberId(),
                                                                    memberResponseDto.getMemberNickName()));
    }

    @PostMapping("/api/opentalk/member/checkNickName")
    public ResponseEntity<Boolean> checkDuplicateNickName(@RequestParam("memberNickName") String memberNickName){
        return ResponseEntity.ok(memberService.checkNicknameDuplicate(memberNickName));
    }

    @PostMapping("/api/opentalk/member/changePassword")
    public ResponseEntity<Boolean> changePassword(@RequestParam("memberEmail")String memberEmail,
                                                  @RequestParam("exPassword") String exPassword,
                                                  @RequestParam("newPassword") String newPassword){
        return ResponseEntity.ok(memberService.changePassword(memberEmail, exPassword, newPassword));
    }

    @GetMapping("/api/opentalk/member/allInviteMessages/{memberNickName}")
    public ResponseEntity<List<InviteDto>> allInviteMessages(@PathVariable("memberNickName") String memberNickName){
        return ResponseEntity.ok(memberService.getAllInviteMessages(memberNickName));
    }

    @PostMapping("/api/opentalk/member/deleteMessage")
    public void deleteMessage(@RequestParam("inviteId") String inviteId){
        memberService.removeInviteMessages(inviteId);
    }

    @GetMapping("/api/opentalk/member/allPersonalMessages/{memberNickName}")
    public ResponseEntity<List<PersonalMessageDto>> allPersonalMessages(@PathVariable("memberNickName") String memberNickName){
        return ResponseEntity.ok(memberService.getAllPersonalMessages(memberNickName));
    }

    public void sendPersonalMessage(@RequestBody @Valid PersonalMessageDto personalMessageDto){
        memberService.sendPersonalMessage(personalMessageDto);
    }
}
