package com.example.opentalk.dto;

import com.example.opentalk.entity.Authority;
import com.example.opentalk.entity.MemberEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberRequestDto {
    private String memberId;
    private String memberPassword;
    private String memberEmail;
    private String memberName;
    private String memberNickName;
    private Authority authority;

    public MemberEntity toMember(PasswordEncoder passwordEncoder) {
        return MemberEntity.builder()
                .memberId(memberId)
                .memberEmail(memberEmail)
                .memberPassword(passwordEncoder.encode(memberPassword))
                .memberName(memberName)
                .memberNickName(memberNickName)
                .authority(Authority.ROLE_USER)
                .build();
    }

    public static MemberRequestDto toMemberRequestDto(MemberEntity member){
        return MemberRequestDto.builder()
                .memberId(member.getMemberId())
                .memberPassword(member.getMemberPassword())
                .memberEmail(member.getMemberEmail())
                .memberName(member.getMemberName())
                .memberNickName(member.getMemberNickName())
                .authority(member.getAuthority())
                .build();
    }

    public UsernamePasswordAuthenticationToken toAuthentication() {
        return new UsernamePasswordAuthenticationToken(memberId, memberPassword);
    }
}
