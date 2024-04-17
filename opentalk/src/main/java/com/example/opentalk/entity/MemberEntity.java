package com.example.opentalk.entity;

import com.example.opentalk.dto.AuthDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.util.List;

@Builder
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
    private UserRole authority;
    @Column(nullable = false)
    @ColumnDefault("profile_prototype.jpg")
    private String imgUrl;

    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<ChatRoomMemberEntity> rooms;

    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<ChatMessageEntity> messages;

    @OneToMany(mappedBy = "member", cascade = CascadeType.PERSIST)
    private List<MemberInviteEntity> inviteMessages;

    protected  MemberEntity(){}




    @Builder
    public MemberEntity(String memberId,
                        String memberPassword, String memberName,
                        String memberNickName, String memberEmail,
                        UserRole authority, String imgUrl){
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.memberName = memberName;
        this.memberNickName = memberNickName;
        this.memberEmail = memberEmail;
        this.authority = authority;
        this.imgUrl = imgUrl;
    }
    public static MemberEntity toMemberEntity(AuthDto.ResponseDto memberResponseDto){
        return MemberEntity.builder()
                .memberId(memberResponseDto.getMemberId())
                .memberNickName(memberResponseDto.getMemberNickName())
                .imgUrl(memberResponseDto.getImgUrl())
                .build();
    }

}
