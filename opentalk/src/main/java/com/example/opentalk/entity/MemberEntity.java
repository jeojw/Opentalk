package com.example.opentalk.entity;

import com.example.opentalk.dto.MemberDTO;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Setter
@Getter
@Table(name = "member")
@Data
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

    public static MemberEntity toMemberEntity(MemberDTO memberDTO){
        MemberEntity memberEntity = new MemberEntity();
        memberEntity.setId(memberDTO.getId());
        memberEntity.setMemberId(memberDTO.getMemberId());
        memberEntity.setMemberPassword(memberDTO.getMemeberPassword());
        memberEntity.setMemberName(memberDTO.getMemberName());
        memberEntity.setMemberNickName(memberDTO.getMemberNickName());
        memberEntity.setMemberEmail(memberDTO.getMemberEmail());

        return memberEntity;
    }

}
