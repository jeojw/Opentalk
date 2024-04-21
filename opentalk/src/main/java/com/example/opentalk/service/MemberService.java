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
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
                .imgUrl(signupDto.getImgUrl())
                .build();
        memberRepository.save(member);
    }

    public boolean changeImage(String memberId, MultipartFile newImg) {
        Optional<MemberEntity> memberOptional = memberRepository.findByMemberId(memberId);
        if (memberOptional.isPresent()) {
            try {
                MemberEntity member = memberOptional.get();
                member.setImgUrl(newImg.getBytes());
                memberRepository.save(member);
                return true;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return false;
    }

    private String saveImageToFileSystem(MultipartFile newImg) throws IOException {
        // 이미지를 저장할 디렉토리 경로 설정 (원하는 경로로 변경하세요)
        String uploadDir = "src/main/resources/static/images";

        // 디렉토리가 존재하지 않으면 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 파일명 생성 (원하는 파일명으로 변경하세요)
        String fileName = System.currentTimeMillis() + "_" + newImg.getOriginalFilename();

        // 파일 경로 설정
        Path filePath = uploadPath.resolve(fileName);

        // 파일 저장
        Files.copy(newImg.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 파일의 상대 경로를 반환
        return "/images/" + fileName;
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
