package com.example.opentalk.dto;

import com.example.opentalk.entity.MemberEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MemberInfoDto {
    private String memberId;
    private String memberName;
    private String memberNickName;
    private String memberEmail;

    public static MemberInfoDto of(MemberEntity member) {
        return MemberInfoDto.builder()
                .memberId(member.getMemberId())
                .memberName(member.getMemberName())
                .memberNickName(member.getMemberNickName())
                .memberEmail(member.getMemberEmail())
                .build();
    }
}
