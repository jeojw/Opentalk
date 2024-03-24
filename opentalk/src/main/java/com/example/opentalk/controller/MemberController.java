package com.example.opentalk.controller;

import com.example.opentalk.dto.MemberDTO;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("api/opentalk/member/enroll")
    public String enrollForm(){
        return "{}";
    }
    @PostMapping("/api/opentalk/member/enroll")
    public String save(@RequestBody MemberDTO memberDTO){
        System.out.println("MemberController.save");
        System.out.println("memberDTO = " + memberDTO);
        memberService.save(memberDTO);
        return "login";
    }
    @PostMapping("/api/opentalk/member/login")
    public MemberDTO login(@RequestBody MemberDTO memberDTO, HttpSession session){
        System.out.println("getMemberId: ");
        System.out.println(memberDTO.getMemberId());
        MemberDTO loginResult = memberService.login(memberDTO);

        if (loginResult != null){
            System.out.println(loginResult.getMemberNickName());
            session.setAttribute("NickName", loginResult.getMemberNickName());
            return loginResult;
        }
        else{
            MemberDTO tmpDTO = new MemberDTO();
            return tmpDTO;
        }
    }

    @PostMapping("/api/opentalk/member/logout")
    public String logout(HttpServletRequest request){
        HttpSession session = request.getSession(false);
        if (session != null){
            session.invalidate();
        }
        return "logout";
    }

    @GetMapping("/api/opentalk/member")
    public String findAll(Model model){
        List<MemberDTO> memberDTOList = memberService.findAll();
        model.addAttribute("memberList", memberDTOList);
        return "list";
    }

    @GetMapping("/api/opentalk/member/{id}")
    public String findById(@PathVariable Long id, Model model){
        MemberDTO memberDTO = memberService.findById(id);
        model.addAttribute("member", memberDTO);
        return "detail";
    }

    @GetMapping("/api/opentalk/member/delete/{id}")
    public String deleteById(@PathVariable Long id){
        memberService.deleteById(id);

        return "redirect:/member/";
    }


    // 아이디 중복 체크
    @PostMapping("/api/opentalk/member/checkId/{memberId}")
    public ResponseEntity<Boolean> checkLoginId(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.checkIdDuplicate(memberId));
    }

    // 비밀번호 찾기 시 아이디 먼저 인증
    @PostMapping("/api/opentalk/member/authId/{memberId}")
    public ResponseEntity<Boolean> authId(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.authId(memberId));
    }

    //로그인 정보 일치여부 확인
    @GetMapping("/api/opentalk/member/checkLogin/{memberId}/{memberPassword}")
    public ResponseEntity<Boolean> checkLogin(@PathVariable String memberId, @PathVariable String memberPassword){
        return ResponseEntity.ok(memberService.checkLoginAgree(memberId, memberPassword));
    }

    //아이디 찾기
    @PostMapping("/api/opentalk/member/findId/{memberEmail}")
    public ResponseEntity<String> searchId(@PathVariable String memberEmail){
        return ResponseEntity.ok(memberService.searchId(memberEmail));
    }
    //비밀번호 변경
    @PostMapping("/api/opentalk/member/findPw/{memberId}/{memberEmail}")
    public ResponseEntity<String> searchPw(@PathVariable String memberId, @PathVariable String memberEmail){
        return ResponseEntity.ok(memberService.searchPw(memberId, memberEmail));
    }
    //현재 비밀번호 찾기
    @PostMapping("/api/opentalk/member/changePw/{memberId}")
    public ResponseEntity<String> exPassword(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.ReturnPrePassword(memberId));
    }

    @PostMapping("/api/opentalk/member/changePw/{exPassword}/{newPassword}")
    public void changePw(@PathVariable String exPassword, @PathVariable String newPassword){
        memberService.ChangePassword(exPassword, newPassword);
    }

    //회원가입 시 아이디 중복 체크
    @GetMapping("/api/opentalk/member/id/{memberId}")
    public ResponseEntity<Boolean> checkIdDuplicate(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.checkIdDuplicate(memberId));
    }
    //회원가입 시 닉네임 중복 체크
    @GetMapping("/api/opentalk/member/nickname/{memberNickName}")
    public ResponseEntity<Boolean> checkNickNameDuplicate(@PathVariable String memberNickName){
        return ResponseEntity.ok(memberService.checkNickNameDuplicate(memberNickName));
    }
    //회원가입 시 이메일 중복 체크
    @GetMapping("/api/opentalk/member/email/{memberEmail}")
    public ResponseEntity<Boolean> checkEmailDuplicate(@PathVariable String memberEmail) {
        return ResponseEntity.ok(memberService.checkEmailDuplicate(memberEmail));
    }
}
