package com.example.opentalk.FCM;

import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class FCMNotificationService {
    private final FirebaseMessaging firebaseMessaging;
    private final MemberRepository memberRepository;

    public String sendNotificationByToken(FCMNotificationRequestDto requestDto){
        Optional<MemberEntity> member = memberRepository.findByMemberId(requestDto.getTargetUserId());

        if (member.isPresent()){
            if (member.get().getFirebaseToken() != null){
                Notification notification = Notification.builder()
                        .setTitle(requestDto.getTitle())
                        .setBody(requestDto.getBody())
                        .build();

                Message message = Message.builder()
                        .setToken(member.get().getFirebaseToken())
                        .setNotification(notification)
                        .build();

                try {
                    firebaseMessaging.send(message);
                    return "알림을 성공적으로 전송했습니다. targetUserId=" + requestDto.getTargetUserId();
                } catch (FirebaseMessagingException e) {
                    throw new RuntimeException(e);
                }
            } else{
                return "서버에 저장된 해당 유저의 FirebaseToken이 존재하지 않습니다. targetUserId" + requestDto.getTargetUserId();
            }
        } else{
            return "해당 유저가 존재하지 않습니다. targetUserId" + requestDto.getTargetUserId();
        }
    }
}
