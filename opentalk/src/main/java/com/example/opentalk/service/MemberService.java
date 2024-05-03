package com.example.opentalk.service;

import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.dto.InviteDto;
import com.example.opentalk.dto.PersonalMessageDto;
import com.example.opentalk.entity.ChatRoomEntity;
import com.example.opentalk.entity.InviteEntity;
import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.entity.PersonalMessageEntity;
import com.example.opentalk.repository.*;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.WriteChannel;
import com.google.cloud.storage.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final BCryptPasswordEncoder encoder;
    private final InviteMessageRepository inviteMessageRepository;
    private final MemberInviteRepository memberInviteRepository;
    private  final PersonalMessageRepository personalMessageRepository;

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
                BlobId blobId = BlobId.of(bucketName, uuid);
                BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                        .setContentType(ext).build();

                try (WriteChannel writer = storage.writer(blobInfo)){
                    byte[] imageData = newImg.getBytes();
                    writer.write(ByteBuffer.wrap(imageData));
                } catch (Exception ex){
                    ex.printStackTrace();
                }
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
    public List<AuthDto.ResponseDto> searchMember(String roomId, String nickName){
        Optional<ChatRoomEntity> chatRoom = chatRoomRepository.findByRoomId(roomId);
        List<Optional<MemberEntity>> list = memberRepository.searchByMemberNickName(nickName);
        List<AuthDto.ResponseDto> returnList = new ArrayList<>();
        if (chatRoom.isPresent()) {
            for (Optional<MemberEntity> member : list) {
                if (member.isPresent()){
                    if (!Objects.equals(chatRoomMemberRepository.existByRoomMemberId(chatRoom.get().getId(), member.get().getId()), BigInteger.ONE)){
                        returnList.add(AuthDto.ResponseDto.builder()
                                .memberId(member.get().getMemberId())
                                .memberName(member.get().getMemberName())
                                .memberNickName(member.get().getMemberNickName())
                                .imgUrl(member.get().getImgUrl())
                                .build());
                    }
                }
            }
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
                                .inviteId(entity.getInviteId())
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
    public List<PersonalMessageDto> getAllPersonalMessages(String memberNickName){
        Optional<MemberEntity> member = memberRepository.findByMemberNickName(memberNickName);
        Optional<List<PersonalMessageEntity>> messageEntities = personalMessageRepository.getAllMessages(memberNickName);
        List<PersonalMessageDto> messages = new ArrayList<>();
        if (member.isPresent() && messageEntities.isPresent()){
            for (PersonalMessageEntity entity : messageEntities.get()){
                messages.add(PersonalMessageDto.builder()
                                .messageId(entity.getMessageId())
                                .receiver(entity.getReceiver())
                                .caller(entity.getCaller())
                                .message(entity.getMessage())
                        .build());
            }
            return messages;
        }
        return null;
    }

    @Transactional
    public void removeInviteMessages(String inviteId){
        Optional<InviteEntity> message = inviteMessageRepository.getInviteMessage(inviteId);
        if (message.isPresent()){
            Optional<MemberEntity> member = memberRepository.findByMemberNickName(message.get().getInvitedMember());
            if (member.isPresent()) {
                memberInviteRepository.deleteEntity(message.get().getId(), member.get().getId());
                inviteMessageRepository.delete(message.get());
            }
        }
    }

    @Transactional
    public void sendPersonalMessage(PersonalMessageDto personalMessageDto){
        PersonalMessageEntity personalMessageEntity = PersonalMessageEntity.builder()
                .receiver(personalMessageDto.getReceiver())
                .caller(personalMessageDto.getCaller())
                .message(personalMessageDto.getMessage())
                .build();
    }
}
