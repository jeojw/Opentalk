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
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final BCryptPasswordEncoder encoder;
    private final InviteMessageRepository inviteMessageRepository;
    private final ResourceLoader resourceLoader;

    public void singUp(AuthDto.SignupDto signupDto){
        MemberEntity member = MemberEntity.builder()
                .memberId(signupDto.getMemberId())
                .memberPassword(signupDto.getMemberPassword())
                .memberName(signupDto.getMemberName())
                .memberNickName(signupDto.getMemberNickName())
                .memberEmail(signupDto.getMemberEmail())
                .authority(signupDto.getAuthority())
                .imgUrl(signupDto.getImgUrl())
                .build();
        memberRepository.save(member);
    }

    public boolean changeImage(String memberId, MultipartFile newImg) throws IOException {
        Optional<MemberEntity> memberOptional = memberRepository.findByMemberId(memberId);
        if (memberOptional.isPresent()) {
            String originalFilename = newImg.getOriginalFilename();
            String saveFileName = createSaveFileName(originalFilename);

            String uploadDirectory = "classpath:static/";
            Path uploadPath = Paths.get(resourceLoader.getResource(uploadDirectory).getURI());
            File destinationFile = uploadPath.resolve(saveFileName).toFile();
            newImg.transferTo(destinationFile);

            memberOptional.get().setImgUrl("/static/" + saveFileName);
            memberRepository.save(memberOptional.get());

            return true;
        }
        return false;
    }

    private String createSaveFileName(String originalFilename) {
        String ext = extractExt(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + ext;
    }

    private String extractExt(String originalFilename) {
        int pos = originalFilename.lastIndexOf(".");
        return originalFilename.substring(pos + 1);
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
