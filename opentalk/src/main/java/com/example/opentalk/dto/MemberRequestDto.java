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

    public UsernamePasswordAuthenticationToken toAuthentication() {
        return new UsernamePasswordAuthenticationToken(memberId, memberPassword);
    }
}
