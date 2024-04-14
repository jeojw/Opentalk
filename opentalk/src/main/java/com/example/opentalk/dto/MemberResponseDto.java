package com.example.opentalk.dto;

import com.example.opentalk.entity.MemberEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberResponseDto {
    private String memberId;
    private String memberNickName;
    private String imgUrl;

    public static MemberResponseDto of(MemberEntity member) {
        return MemberResponseDto.builder()
                .memberId(member.getMemberId())
                .memberNickName(member.getMemberNickName())
                .imgUrl(member.getImgUrl())
                .build();
    }
}
