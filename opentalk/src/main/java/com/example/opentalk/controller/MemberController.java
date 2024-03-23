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

    @GetMapping("/api/opentalk/member/checkId/{memberId}")
    public ResponseEntity<Boolean> checkLoginId(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.checkIdDuplicate(memberId));
    }

    @GetMapping("/api/opentalk/member/checkLogin/{memberId}/{memberPassword}")
    public ResponseEntity<Boolean> checkLogin(@PathVariable String memberId, @PathVariable String memberPassword){
        return ResponseEntity.ok(memberService.checkLoginAgree(memberId, memberPassword));
    }

    @GetMapping("/api/opentalk/member/id/{memberId}")
    public ResponseEntity<Boolean> checkIdDuplicate(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.checkIdDuplicate(memberId));
    }
    @GetMapping("/api/opentalk/member/nickname/{memberNickName}")
    public ResponseEntity<Boolean> checkNickNameDuplicate(@PathVariable String memberNickName){
        return ResponseEntity.ok(memberService.checkNickNameDuplicate(memberNickName));
    }
    @GetMapping("/api/opentalk/member/email/{memberEmail}")
    public ResponseEntity<Boolean> checkEmailDuplicate(@PathVariable String memberEmail) {
        return ResponseEntity.ok(memberService.checkEmailDuplicate(memberEmail));
    }
}
