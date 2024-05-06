package com.example.opentalk.service;

import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;


@RequiredArgsConstructor
@Service
public class FCMService {
    private final MemberRepository memberRepository;
    private final RedisService redisService;
    private static final String SERVER = "Server";

    // Constants for message titles and contents
    private static final String RECEIVE_TITLE = "쪽지 알림.";
    private static final String RECEIVE_CONTENT = "새로운 쪽지가 도착했습니다.";
    private static final String INVITE_TITLE = "초대 알림.";
    private static final String INVITE_CONTENT = "새로운 초대 메세지가 도착했습니다.";

    public void sendReceiveMessage(String memberNickName){
        sendMessage(memberNickName, RECEIVE_TITLE, RECEIVE_CONTENT);
    }

    public void sendInviteMessage(String memberNickName){
        sendMessage(memberNickName, INVITE_TITLE, INVITE_CONTENT);
    }

    private void sendMessage(String memberNickName, String title, String content) {
        Optional<MemberEntity> member = memberRepository.findByMemberNickName(memberNickName);
        if (member.isPresent()){
            if (!redisService.hasKey("FT(" + SERVER + "):" + member.get().getMemberId())){
                return;
            }

            String token = redisService.getValues("FT(" + SERVER + "):" + member.get().getMemberId());
            Message message = Message.builder()
                    .putData("title", title)
                    .putData("content", content)
                    .setToken(token)
                    .build();

            send(message);
        }
    }

    private void send(Message message){
        FirebaseMessaging.getInstance().sendAsync(message);
    }
}
