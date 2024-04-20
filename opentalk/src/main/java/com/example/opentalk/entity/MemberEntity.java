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
    @Column(nullable = false, columnDefinition = "text")
    @ColumnDefault(value = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAwQFAQIG/8QAMxABAAIBAgMFBAoDAQAAAAAAAAECAwQRITFBBTJRYXESEyKBM0JSU2JykqHB0UORsRX/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAgEDBP/EABsRAQEBAQEBAQEAAAAAAAAAAAABAhESMSFB/9oADAMBAAIRAxEAPwD64B73kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN/QAJAAAAAAAAAAAAAAAAAAAAeqUtktFKRvMg5EbzEV3mfCIXcHZ17bTmn2Y8I4yuaXTU08ct79bf0nc7tcyr00enr/jifzTuk9xi+7p/pII7VcV7aPT2+pEflVM/Z1q8cMzb8M82mNmrGWPn5iYmYmJjbnu42tXpaamu88LxHC38Me9LY7zW8bTHR1zrqLOPIDWAAAAAAAAAAAAAAHLj0avZmD2MUZrd+3L0ZmOk5MtKR1nZv7RHCOXRG7/ABWYAOSwAAABR7Twe3jjNHOvP0XnLRFqzWeUxs2XlLHz49ZKTS81tziXl3cgAAAAAAAAAAAAAFjQRvq6R0jeWz1Y2hnbVU8921Llv6vPxwBCgAAAACOY1i6+NtZk85if2QJ9bO+qyfm2/ZA7z440AaAAAAAAAAAAAAO0vNL1tHSd2/S0XpW0TvExu+f8PJf7O1EVj3N52r9WZRuKzWkHXaRyWADQAB5yX93jm89HqOPn5MztPU+3MYqWjaOc+KszqbVGZmZ35zMzuOy47OYAAAAAAAAAAAAAAADR0evjhjz/ACsv78uO+/VgcEmHUZcH0V9o8EXCppuf7GbTtO0fSY4mPwpP/Tx/d3/ZHmq6vG+08eDOv2n91j/VKrm1OXNwvbh4RwhszS6W9Zr9onHp/ndnA6ScRb0AawAAAAAAAAAAAAB2AcHYiZnaImZ6bLWLs/LfabzFI8+bLZGydVOuxz5Tu16aDBXb2om/rKeuLHXu0rHyTdxvlhRW08qTv6PXucv3V/0y3jZntvl8/Nbx3scx6w5wfQ+vH1l4vhxX72Os/I9s8sH5jWydn4bdyJpPTZTzaHLj5fHH4VTUrLOKoeO8bbCmAAAAAAAAAAAACfTaTLqLRPdx9bJNFpPffHkmYpHTxa0REREV4VjlEI1riplFhwY8MfBXj49UoOfVgAADAAAJ48wGodRpseePija32oZWo099PPx93paG25etb1mLxvE81Z1Ymx8+LOs0s6ed43nH0mOivPlydZeudnHAGgAAAAAAsaPTTqMvH6OvGZQREzO1ectvTYow4a0r4bzPmnV5G5iWIiKxERERHKAHF0AAAAAAAAAAAActWL1mtoiYnnuxdVgtp8s1nuz3Z8m2g1mGM2C0fWjjWVZvKyxihtMcx2cwAAAACeQLfZuOL6iLfVrH7tb/AKqdmU9nT+19qVtx1f10k/ABLQAAAAAAAAAAAA2/oAY/aGL3eptaO7f4lZqdqU3wxf7M8fRl/wA8XbN7HPX5QBTH/9k=")
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
