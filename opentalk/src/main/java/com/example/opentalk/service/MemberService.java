package com.example.opentalk.service;

import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.dto.InviteDto;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.InviteEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.ChatRoomRepository;
import com.example.opentalk.repository.InviteMessageRepository;
import com.example.opentalk.repository.MemberInviteRepository;
import com.example.opentalk.repository.MemberRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final BCryptPasswordEncoder encoder;
    private final InviteMessageRepository inviteMessageRepository;
    private final MemberInviteRepository memberInviteRepository;

    @Value("${spring.cloud.gcp.storage.bucket}")
    private String bucketName;
    @Value("${spring.cloud.gcp.storage.credentials.location}")
    private String keyFileName;
    @Value("${spring.cloud.gcp.storage.project-id}")
    private String bucketId;

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

    public void deletePreImage(String objectURL){
        String projectId = bucketId;
        String objectName = "null";
        String bucketName_param = bucketName;
        Pattern pattern = Pattern.compile("/([^/]+)$");
        Matcher matcher = pattern.matcher(objectURL);
        if (matcher.find()) {
            objectName = matcher.group(1);
        }

        if (!objectName.equals("profile_prototype")){
            Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
            Blob blob = storage.get(bucketName_param, objectName);

            Storage.BlobSourceOption precondition =
                    Storage.BlobSourceOption.generationMatch(blob.getGeneration());

            storage.delete(bucketName, objectName, precondition);
        }
    }

    public boolean changeImage(String memberId, MultipartFile newImg) throws IOException {
        Optional<MemberEntity> memberOptional = memberRepository.findByMemberId(memberId);
        Optional<String> curImg = memberRepository.returnCurImg(memberId);

        if (memberOptional.isPresent()) {
            InputStream keyFile = ResourceUtils.getURL(keyFileName).openStream();
            System.out.print(keyFileName);

            String uuid = UUID.randomUUID().toString();
            String ext = newImg.getContentType();

            Storage storage = StorageOptions.newBuilder()
                    .setCredentials(GoogleCredentials.fromStream(keyFile))
                    .build()
                    .getService();

            String imgUrl = "https://storage.googleapis.com/" + bucketName + "/" + uuid;

            curImg.ifPresent(this::deletePreImage);

            if (newImg.isEmpty()) {
                imgUrl = null;
                return false;
            } else {
                BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, uuid)
                        .setContentType(ext).build();

                Blob blob = storage.create(blobInfo, newImg.getInputStream());
                memberOptional.get().setImgUrl(imgUrl);
                memberRepository.save(memberOptional.get());
            }

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

    @Transactional
    public void removeInviteMessages(String inviter, String invitedMember){
        Optional<InviteEntity> message = inviteMessageRepository.getInviteMessage(inviter, invitedMember);
        Optional<MemberEntity> InvitedEntity = memberRepository.findByMemberNickName(invitedMember);
        if (InvitedEntity.isPresent() && message.isPresent()){
            memberInviteRepository.deleteEntity(message.get().getId(), InvitedEntity.get().getId());
            inviteMessageRepository.deleteMessage(invitedMember, inviter);
        }
    }
}
