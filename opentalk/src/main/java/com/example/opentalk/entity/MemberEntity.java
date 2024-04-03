package com.example.opentalk.entity;

import com.example.opentalk.dto.MemberDTO;
import lombok.*;

import javax.persistence.*;
import java.util.List;

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
    @Column
    private String authority;
    @ManyToMany(mappedBy = "members")
    private List<ChatRoomEntity> chatRooms;

    protected  MemberEntity(){}

    @Builder
    public MemberEntity(Long id, String memberId, String memberPassword, String memberName, String memberNickName, String memberEmail, String authority){
        this.id = id;
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.memberName = memberName;
        this.memberNickName = memberNickName;
        this.memberEmail = memberEmail;
        this.authority = authority;
    }
    public static MemberEntity toMemberEntity(MemberDTO memberDTO){
        MemberEntity memberEntity = new MemberEntity(
                memberDTO.getId(),
                memberDTO.getMemberId(),
                memberDTO.getMemberPassword(),
                memberDTO.getMemberName(),
                memberDTO.getMemberNickName(),
                memberDTO.getMemberEmail(),
                memberDTO.getAuthority());
        return memberEntity;
    }

}
