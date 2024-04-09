package com.example.opentalk.entity;

import com.example.opentalk.dto.MemberResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

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
    @Enumerated(EnumType.STRING)
    private Authority authority;

    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<ChatRoomMemberEntity> rooms;

    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<ChatMessageEntity> messages;

    protected  MemberEntity(){}

    @Builder
    public MemberEntity(String memberId,
                        String memberPassword, String memberName,
                        String memberNickName, String memberEmail,
                        Authority authority){
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.memberName = memberName;
        this.memberNickName = memberNickName;
        this.memberEmail = memberEmail;
        this.authority = authority;
    }
    public static MemberEntity toMemberEntity(MemberResponseDto memberResponseDto){
        return MemberEntity.builder()
                .memberId(memberResponseDto.getMemberId())
                .memberNickName(memberResponseDto.getMemberNickName())
                .build();
    }

}
