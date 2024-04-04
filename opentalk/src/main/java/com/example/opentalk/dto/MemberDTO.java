package com.example.opentalk.dto;

import com.example.opentalk.entity.MemberEntity;
import lombok.*;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.util.Date;
import java.util.Optional;

@NoArgsConstructor
@Data
public class MemberDTO {
    private Long id;
    @NotBlank(message = "아이디를 입력해주세요.")
    private String memberId;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String memberPassword;

    @NotBlank(message = "이름을 입력해주세요.")
    private String memberName;

    @NotBlank(message = "닉네임을 입력해주세요.")
    private String memberNickName;

    @Email(message = "올바른 이메일 주소를 입력해주세요.")
    @NotBlank(message = "이메일 주소를 입력해주세요.")
    private String memberEmail;

    @NotBlank
    private String authority;

    private Date join_date;

    public static MemberDTO toMemberDTO(MemberEntity memberEntity){
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setId(memberEntity.getId());
        memberDTO.setMemberId(memberEntity.getMemberId());
        memberDTO.setMemberPassword(memberEntity.getMemberPassword());
        memberDTO.setMemberName(memberEntity.getMemberName());
        memberDTO.setMemberNickName(memberEntity.getMemberNickName());
        memberDTO.setMemberEmail(memberEntity.getMemberEmail());
        memberDTO.setAuthority(memberEntity.getAuthority());

        return memberDTO;
    }

    public static MemberDTO toMemberDTO_Op(Optional<MemberEntity> memberEntity){
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setId(memberEntity.get().getId());
        memberDTO.setMemberId(memberEntity.get().getMemberId());
        memberDTO.setMemberPassword(memberEntity.get().getMemberPassword());
        memberDTO.setMemberName(memberEntity.get().getMemberName());
        memberDTO.setMemberNickName(memberEntity.get().getMemberNickName());
        memberDTO.setMemberEmail(memberEntity.get().getMemberEmail());
        memberDTO.setAuthority(memberEntity.get().getAuthority());

        return memberDTO;
    }
}