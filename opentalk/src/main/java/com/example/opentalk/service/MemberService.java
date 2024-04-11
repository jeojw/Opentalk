package com.example.opentalk.service;

import com.example.opentalk.Config.SecurityUtil;
import com.example.opentalk.dto.MemberInfoDto;
import com.example.opentalk.dto.MemberResponseDto;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberResponseDto getMyInfoBySecurity() {
        return memberRepository.findById(SecurityUtil.getCurrentMemberId())
                .map(MemberResponseDto::of)
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
    }

    public MemberInfoDto getMyProfileBySecurity() {
        return memberRepository.findById(SecurityUtil.getCurrentMemberId())
                .map(MemberInfoDto::of)
                .orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
    }

    public List<MemberResponseDto> searchMember(String memberNickName){
        List<Optional<MemberEntity>> members = memberRepository.searchByMemberNickName(memberNickName);
        List<MemberResponseDto> memberResponseDtoList = new ArrayList<>();
        for (Optional<MemberEntity> member : members){
            member.ifPresent(memberEntity -> memberResponseDtoList.add(MemberResponseDto.of(memberEntity)));
        }
        return memberResponseDtoList;
    }

    @Transactional
    public String findMemberId(String memberEmail){
        return memberRepository.SearchMemberId(memberEmail);
    }

    @Transactional
    public boolean existId(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }

    @Transactional
    public String getExPw(String memberEmail){
        return memberRepository.SearchMemberPassword(memberEmail);
    }

    @Transactional
    public boolean checkNicknameDuplicate(String newNickname){
        return memberRepository.existsByMemberNickName(newNickname);
    }

    @Transactional
    public MemberResponseDto changeMemberNickname(String memberId, String nickname) {
        MemberEntity member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
        member.setMemberNickName(nickname);
        return MemberResponseDto.of(memberRepository.save(member));
    }

    @Transactional
    public MemberResponseDto changeMemberPassword(String exPassword, String newPassword) {
        MemberEntity member = memberRepository.findById(SecurityUtil.getCurrentMemberId()).orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
        if (!passwordEncoder.matches(exPassword, member.getMemberPassword())) {
            throw new RuntimeException("비밀번호가 맞지 않습니다");
        }
        member.setMemberPassword(passwordEncoder.encode(newPassword));
        return MemberResponseDto.of(memberRepository.save(member));

    }
}
