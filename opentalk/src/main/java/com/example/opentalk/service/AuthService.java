package com.example.opentalk.service;

import com.example.opentalk.Jwt.TokenProvider;
import com.example.opentalk.dto.MemberRequestDto;
import com.example.opentalk.dto.MemberResponseDto;
import com.example.opentalk.dto.TokenDto;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final AuthenticationManagerBuilder managerBuilder;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    public MemberResponseDto signup(MemberRequestDto requestDto) {
        if (memberRepository.existsByMemberId(requestDto.getMemberId())) {
            throw new RuntimeException("이미 가입되어 있는 유저입니다");
        }
        if (memberRepository.existsByMemberEmail(requestDto.getMemberEmail())){
            throw new RuntimeException("이미 사용되고 있는 이메일입니다.");
        }
        if (memberRepository.existsByMemberNickName(requestDto.getMemberNickName())){
            throw new RuntimeException("이미 사용되고 있는 닉네임입니다.");
        }
        MemberEntity member = requestDto.toMember(passwordEncoder);
        return MemberResponseDto.of(memberRepository.save(member));
    }

    public boolean checkDuplicateId(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }

    public boolean checkDuplicateNickName(String memberNickName){
        return memberRepository.existsByMemberNickName(memberNickName);
    }

    public boolean checkDuplicateEmail(String memberEmail){
        return memberRepository.existsByMemberEmail(memberEmail);
    }

    public String getExPassword(String memberEmail){
        return memberRepository.ReturnExPw(memberEmail);
    }

    public void changePassword(String exPassword, String newPassword){
        memberRepository.ChangePw(exPassword, newPassword);
    }

    public boolean authId(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }

    public TokenDto login(MemberRequestDto requestDto) {
        UsernamePasswordAuthenticationToken authenticationToken = requestDto.toAuthentication();

        Authentication authentication = managerBuilder.getObject().authenticate(authenticationToken);

        return tokenProvider.generateTokenDto(authentication);
    }

}
