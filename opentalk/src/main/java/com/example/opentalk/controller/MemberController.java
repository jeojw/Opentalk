package com.example.opentalk.controller;

import com.example.opentalk.dto.MemberDTO;
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
    @GetMapping("/opentalk/save")
    public String saveForm(){
        return "save";
    }

    @PostMapping("/opentalk/save")
    public String save(@ModelAttribute MemberDTO memberDTO){
        System.out.println("MemberController.save");
        System.out.println("memberDTO = " + memberDTO);
        memberService.save(memberDTO);
        return "login";
    }

    @GetMapping("/opentalk/login")
    public String loginForm(){
        return "login";
    }

    @PostMapping("/opentalk/login")
    public String login(@ModelAttribute MemberDTO memberDTO, HttpSession session){
        MemberDTO loginResult = memberService.login(memberDTO);
        if (loginResult != null){
            session.setAttribute("NickName", loginResult.getMemberNickName());
            return "redirect:/opentalk/main";
        }
        else{
            return "login";
        }
    }

    @GetMapping("/opentalk/member/")
    public String findAll(Model model){
        List<MemberDTO> memberDTOList = memberService.findAll();
        model.addAttribute("memberList", memberDTOList);
        return "list";
    }

    @GetMapping("/opentalk/member/{id}")
    public String findById(@PathVariable Long id, Model model){
        MemberDTO memberDTO = memberService.findById(id);
        model.addAttribute("member", memberDTO);
        return "detail";
    }

    @GetMapping("/opentalk/member/delete/{id}")
    public String deleteById(@PathVariable Long id){
        memberService.deleteById(id);

        return "redirect:/member/";
    }

    @GetMapping("/member-Id/{memberId}/exists")
    public ResponseEntity<Boolean> checkIdDuplicate(@PathVariable String memberId){
        return ResponseEntity.ok(memberService.checkIdDuplicate(memberId));
    }
    @GetMapping("/member-NickName/{memberNickName}/exists")
    public ResponseEntity<Boolean> checkNickNameDuplicate(@PathVariable String memberNickName){
        return ResponseEntity.ok(memberService.checkNickNameDuplicate(memberNickName));
    }
    @GetMapping("/member-Email/{memberEmail}/exists")
    public ResponseEntity<Boolean> checkEmailDuplicate(@PathVariable String memberEmail) {
        return ResponseEntity.ok(memberService.checkEmailDuplicate(memberEmail));
    }
}
