package com.example.opentalk.entity;

import com.example.opentalk.dto.MemberDTO;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(name = "OpenTalkMember")
public class MemberEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String memberId;
    @Column
    private String memberPassword;
    @Column
    private String memberName;
    @Column
    private String memberNickName;
    @Column
    private String memberEmail;

    @Builder
    public MemberEntity(Long id, String memberId, String memberPassword, String memberName, String memberNickName, String memberEmail){
        this.id = id;
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.memberName = memberName;
        this.memberNickName = memberNickName;
        this.memberEmail = memberEmail;
    }
    public static MemberEntity toMemberEntity(MemberDTO memberDTO){
        MemberEntity memberEntity = new MemberEntity(
                memberDTO.getId(),
                memberDTO.getMemberId(),
                memberDTO.getMemberPassword(),
                memberDTO.getMemberName(),
                memberDTO.getMemberNickName(),
                memberDTO.getMemberEmail());
        return memberEntity;
    }

}
