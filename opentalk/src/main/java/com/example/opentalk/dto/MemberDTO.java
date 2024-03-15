package com.example.opentalk.dto;

import com.example.opentalk.entity.MemberEntity;
import lombok.*;

import java.util.Date;
import java.util.Optional;

@NoArgsConstructor
@Data
public class MemberDTO {
    private Long id;
    private String memberId;
    private String memeberPassword;
    private String memberName;
    private String memberNickName;
    private String memberEmail;
    private Date join_date;

    public static MemberDTO toMemberDTO(MemberEntity memberEntity){
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setId(memberEntity.getId());
        memberDTO.setMemberId(memberEntity.getMemberId());
        memberDTO.setMemberId(memberEntity.getMemberPassword());
        memberDTO.setMemberName(memberEntity.getMemberName());
        memberDTO.setMemberNickName(memberEntity.getMemberNickName());
        memberDTO.setMemberEmail(memberEntity.getMemberEmail());

        return memberDTO;
    }
}