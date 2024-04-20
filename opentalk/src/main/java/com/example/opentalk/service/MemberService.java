package com.example.opentalk.service;

import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.dto.InviteDto;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.InviteEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatRoomRepository;
import com.example.opentalk.repository.InviteMessageRepository;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final RedisService redisService;
    private final BCryptPasswordEncoder encoder;
    private final InviteMessageRepository inviteMessageRepository;

    public void singUp(AuthDto.SignupDto signupDto){
        MemberEntity member = MemberEntity.builder()
                .memberId(signupDto.getMemberId())
                .memberPassword(signupDto.getMemberPassword())
                .memberName(signupDto.getMemberName())
                .memberNickName(signupDto.getMemberNickName())
                .memberEmail(signupDto.getMemberEmail())
                .authority(signupDto.getAuthority())
                .imgUrl("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAMAAzAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAwQFAQIG/8QAMxABAAIBAgMFBAoDAQAAAAAAAAECAwQRITFBBTJRYXESEyKBM0JSU2JykqHB0UORsRX/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAgEDBP/EABsRAQEBAQEBAQEAAAAAAAAAAAABAhESMSFB/9oADAMBAAIRAxEAPwD64B73kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN/QAJAAAAAAAAAAAAAAAAAAAAeqUtktFKRvMg5EbzEV3mfCIXcHZ17bTmn2Y8I4yuaXTU08ct79bf0nc7tcyr00enr/jifzTuk9xi+7p/pII7VcV7aPT2+pEflVM/Z1q8cMzb8M82mNmrGWPn5iYmYmJjbnu42tXpaamu88LxHC38Me9LY7zW8bTHR1zrqLOPIDWAAAAAAAAAAAAAAHLj0avZmD2MUZrd+3L0ZmOk5MtKR1nZv7RHCOXRG7/ABWYAOSwAAABR7Twe3jjNHOvP0XnLRFqzWeUxs2XlLHz49ZKTS81tziXl3cgAAAAAAAAAAAAAFjQRvq6R0jeWz1Y2hnbVU8921Llv6vPxwBCgAAAACOY1i6+NtZk85if2QJ9bO+qyfm2/ZA7z440AaAAAAAAAAAAAAO0vNL1tHSd2/S0XpW0TvExu+f8PJf7O1EVj3N52r9WZRuKzWkHXaRyWADQAB5yX93jm89HqOPn5MztPU+3MYqWjaOc+KszqbVGZmZ35zMzuOy47OYAAAAAAAAAAAAAAADR0evjhjz/ACsv78uO+/VgcEmHUZcH0V9o8EXCppuf7GbTtO0fSY4mPwpP/Tx/d3/ZHmq6vG+08eDOv2n91j/VKrm1OXNwvbh4RwhszS6W9Zr9onHp/ndnA6ScRb0AawAAAAAAAAAAAAB2AcHYiZnaImZ6bLWLs/LfabzFI8+bLZGydVOuxz5Tu16aDBXb2om/rKeuLHXu0rHyTdxvlhRW08qTv6PXucv3V/0y3jZntvl8/Nbx3scx6w5wfQ+vH1l4vhxX72Os/I9s8sH5jWydn4bdyJpPTZTzaHLj5fHH4VTUrLOKoeO8bbCmAAAAAAAAAAAACfTaTLqLRPdx9bJNFpPffHkmYpHTxa0REREV4VjlEI1riplFhwY8MfBXj49UoOfVgAADAAAJ48wGodRpseePija32oZWo099PPx93paG25etb1mLxvE81Z1Ymx8+LOs0s6ed43nH0mOivPlydZeudnHAGgAAAAAAsaPTTqMvH6OvGZQREzO1ectvTYow4a0r4bzPmnV5G5iWIiKxERERHKAHF0AAAAAAAAAAAActWL1mtoiYnnuxdVgtp8s1nuz3Z8m2g1mGM2C0fWjjWVZvKyxihtMcx2cwAAAACeQLfZuOL6iLfVrH7tb/AKqdmU9nT+19qVtx1f10k/ABLQAAAAAAAAAAAA2/oAY/aGL3eptaO7f4lZqdqU3wxf7M8fRl/wA8XbN7HPX5QBTH/9k=")
                .build();
        memberRepository.save(member);
    }

    public boolean changeImage(String memberId, String newImg){
        Optional<MemberEntity> member = memberRepository.findByMemberId(memberId);
        if (member.isPresent()){
            memberRepository.ChangeImg(member.get().getMemberId(), newImg);
            return true;
        }
        return false;
    }

    @Transactional
    public String findMemberId(String memberEmail){
        Optional<MemberEntity> member = memberRepository.SearchMemberId(memberEmail);
        if (member.isPresent()){
            return member.get().getMemberId();
        }
        else{
            return "fail";
        }
    }

    @Transactional
    public boolean existId(String memberId){
        return memberRepository.existsByMemberId(memberId);
    }

    @Transactional
    public String getExPw(String memberEmail){
        return memberRepository.SearchMemberPassword(memberEmail);
    }

    @Transactional
    public boolean checkNicknameDuplicate(String newNickname){
        return memberRepository.existsByMemberNickName(newNickname);
    }

    @Transactional
    public List<AuthDto.ResponseDto> searchMember(String nickName){
        List<Optional<MemberEntity>> list = memberRepository.searchByMemberNickName(nickName);
        List<AuthDto.ResponseDto> returnList = new ArrayList<>();
        for (Optional<MemberEntity> member : list){
            member.ifPresent(memberEntity -> returnList.add(AuthDto.ResponseDto.builder()
                    .memberId(memberEntity.getMemberId())
                    .memberName(memberEntity.getMemberName())
                    .memberNickName(memberEntity.getMemberNickName())
                    .imgUrl(memberEntity.getImgUrl())
                    .build()));
        }

        return returnList;
    }

    @Transactional
    public AuthDto.ResponseDto changeMemberNickname(String memberId, String nickname) {
        MemberEntity member = memberRepository.findByMemberId(memberId).orElseThrow(() -> new RuntimeException("로그인 유저 정보가 없습니다"));
        Optional<List<ChatRoomEntity>> chatRooms = chatRoomRepository.findByManager(member.getMemberNickName());
        if (chatRooms.isPresent()){
            for (ChatRoomEntity room : chatRooms.get()){
                chatRoomRepository.updateManager(room.getRoomId(), nickname);
            }
        }
        member.setMemberNickName(nickname);
        return AuthDto.ResponseDto.toResponse(memberRepository.save(member));
    }

    @Transactional
    public boolean changePassword(String memberEmail, String exPassword, String newPassword){
        if (encoder.matches(exPassword, getExPw(memberEmail))){
            memberRepository.ChangePw(memberEmail, encoder.encode(newPassword));
            return true;
        }
        else
            return false;
    }

    @Transactional
    public List<InviteDto> getAllInviteMessages(String memberNickName){
        List<InviteDto> returnList = new ArrayList<>();
        Optional<List<InviteEntity>> list = inviteMessageRepository.getAllInvitedMessages(memberNickName);
        if (list.isPresent()){
            for (InviteEntity entity : list.get()){
                returnList.add(InviteDto.builder()
                                .roomId(entity.getRoomId())
                                .roomName(entity.getRoomName())
                                .inviter(entity.getInviter())
                                .invitedMember(entity.getInvitedMember())
                                .message(entity.getMessage())
                                .build());
            }
        }
        return returnList;
    }
}
