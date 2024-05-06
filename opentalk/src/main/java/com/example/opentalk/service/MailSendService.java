package com.example.opentalk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Random;

@Service
public class    MailSendService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private RedisService redisService;
    private int authNumber;

    public boolean CheckAuthNum(String email, String authNum){
        if (redisService.getValues(authNum) == null)
            return false;
        else return redisService.getValues(authNum).equals(email);
    }

    public void makeRandomNumber(){
        Random r = new Random();
        StringBuilder randomNumber = new StringBuilder();
        for (int i = 0; i < 6; i++){
            randomNumber.append(Integer.toString(r.nextInt(10)));
        }

        authNumber = Integer.parseInt(randomNumber.toString());
    }

    public String joinTitle(String type){
        return switch (type) {
            case "enroll" -> "회원 가입 인증 이메일 입니다.";
            case "findId" -> "아이디 찾기 인증 이메일 입니다.";
            case "findPw" -> "비밀번호 찾기 인증 이메일 입니다.";
            default -> null;
        };

    }
    public String joinEmail(String email, String sendType){
        makeRandomNumber();
        String setFrom = "jeawookjeong@gmail.com";
        String title = joinTitle(sendType);
        String content =
                "인증 번호는 " + authNumber + "입니다." +
                        "<br>" +
                        "인증번호를 제대로 입력해주세요.";
        mailSend(setFrom, email, title, content);
        return Integer.toString(authNumber);
    }

    public void deleteKey(){
        redisService.deleteValues(Integer.toString(authNumber));
    }

    public void mailSend(String setFrom, String toMail, String title, String content){
        MimeMessage message = mailSender.createMimeMessage();
        try{
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
            helper.setFrom(setFrom);//이메일의 발신자 주소 설정
            helper.setTo(toMail);//이메일의 수신자 주소 설정
            helper.setSubject(title);//이메일의 제목을 설정
            helper.setText(content,true);//이메일의 내용 설정 두 번째 매개 변수에 true를 설정하여 html 설정으로한다.
            mailSender.send(message);
        } catch(MessagingException e){
            e.printStackTrace();
        }
        redisService.setValuesWithTimeout(Integer.toString(authNumber), toMail, 60*5L );
    }
}

