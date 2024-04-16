package com.example.opentalk.service;

import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatRoomRepository;
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

    public void singUp(AuthDto.SignupDto signupDto){
        MemberEntity member = MemberEntity.builder()
                .memberId(signupDto.getMemberId())
                .memberPassword(signupDto.getMemberPassword())
                .memberName(signupDto.getMemberName())
                .memberNickName(signupDto.getMemberNickName())
                .memberEmail(signupDto.getMemberEmail())
                .authority(signupDto.getAuthority())
                .imgUrl("profile_prototype.jpg")
                .build();
        memberRepository.save(member);
    }

    public boolean changeImage(String memberId, String newImg){
        Optional<MemberEntity> member = memberRepository.SearchMemberId(memberId);
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

}
