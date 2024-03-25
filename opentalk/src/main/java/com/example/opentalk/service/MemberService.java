package com.example.opentalk.service;

import com.example.opentalk.dto.MemberDTO;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    public void enroll(MemberDTO memberDTO){
        MemberEntity memberEntity = MemberEntity.toMemberEntity(memberDTO);
        memberRepository.save(memberEntity);
    }

    public MemberDTO login(MemberDTO memberDTO){
        Optional<MemberEntity> byMemberId = memberRepository.findByMemberId(memberDTO.getMemberId());
        if (byMemberId.isPresent()){
            MemberEntity memberEntity = byMemberId.get();
            if (memberEntity.getMemberPassword().equals(memberDTO.getMemberPassword())){
                return MemberDTO.toMemberDTO(memberEntity);
            }else{
                return null;
            }
        }else{
            return null;
        }
    }

    public List<MemberDTO> findAll(){
        List<MemberEntity> memberEntityList = memberRepository.findAll();
        List<MemberDTO> memberDTOList = new ArrayList<>();
        for (MemberEntity memberEntity : memberEntityList){
            memberDTOList.add(MemberDTO.toMemberDTO(memberEntity));
        }
        return memberDTOList;
    }

    public MemberDTO findById(Long id){
        Optional<MemberEntity> optionalMemberEntity = memberRepository.findById(id);
        if (optionalMemberEntity.isPresent()){
            return MemberDTO.toMemberDTO(optionalMemberEntity.get());
        }else{
            return null;
        }
    }

    public void deleteById(Long id){
        memberRepository.deleteById(id);
    }

    public boolean authId(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }

    @Transactional
    public boolean checkLoginAgree(String memberId, String memberPassword){
        String pw = memberRepository.compareByMemberPassword(memberId);
        return memberPassword.equals(pw);
    }

    @Transactional
    public String searchId(String memberEmail){
        if (memberEmail == null || memberEmail.isEmpty()) {
            throw new IllegalArgumentException("Member email cannot be null or empty");
        }
        return memberRepository.SearchMemberId(memberEmail);
    }

    @Transactional
    public String searchPw(String memberId, String memberEmail){
        return memberRepository.SearchMemberPassword(memberId, memberEmail);
    }

    @Transactional
    public void ChangePassword(String exPassword, String newPassword){
        memberRepository.ChangePw(exPassword, newPassword);
    }

    @Transactional
    public String ReturnPrePassword(String memberEmail){
        return memberRepository.ReturnExPw(memberEmail);
    }

    @Transactional
    public boolean checkIdDuplicate(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }
    @Transactional
    public boolean checkNickNameDuplicate(String memberNickName){
        return memberRepository.existsByMemberNickName(memberNickName);
    }
    @Transactional
    public boolean checkEmailDuplicate(String memberEmail){
        return memberRepository.existsByMemberEmail(memberEmail);
    }

}
