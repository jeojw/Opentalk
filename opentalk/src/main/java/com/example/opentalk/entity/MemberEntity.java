package com.example.opentalk.entity;

import com.example.opentalk.dto.MemberRequestDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@AllArgsConstructor
@Setter
@Getter
@Table(name = "OpenTalkMember")
public class MemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String memberId;
    @Column(nullable = false)
    private String memberPassword;
    @Column(nullable = false)
    private String memberName;
    @Column(nullable = false)
    private String memberNickName;
    @Column(nullable = false)
    private String memberEmail;
    @Enumerated(EnumType.STRING)
    private Authority authority;


    protected  MemberEntity(){}

    @Builder
    public MemberEntity(String memberId, String memberPassword, String memberName, String memberNickName, String memberEmail, Authority authority){
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.memberName = memberName;
        this.memberNickName = memberNickName;
        this.memberEmail = memberEmail;
        this.authority = authority;
    }
    public static MemberEntity toMemberEntity(MemberRequestDto memberRequestDto){
        MemberEntity memberEntity = MemberEntity.builder()
                .memberId(memberRequestDto.getMemberId())
                .memberPassword(memberRequestDto.getMemberPassword())
                .memberEmail(memberRequestDto.getMemberEmail())
                .memberName(memberRequestDto.getMemberNickName())
                .memberNickName(memberRequestDto.getMemberNickName())
                .build();

        return memberEntity;
    }

}
