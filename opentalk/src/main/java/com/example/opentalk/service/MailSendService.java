package com.example.opentalk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Random;

@Service
public class MailSendService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private RedisUtil redisUtil;
    private int authNumber;

    public boolean CheckAuthNum(String email, String authNum){
        if (redisUtil.getData(authNum) == null)
            return false;
        else if (redisUtil.getData(authNum).equals(email))
            return true;
        else
            return false;
    }

    public void makeRandomNumber(){
        Random r = new Random();
        String randomNumber = "";
        for (int i = 0; i < 6; i++){
            randomNumber += Integer.toString(r.nextInt(10));
        }

        authNumber = Integer.parseInt(randomNumber);
    }
    public String joinEmail(String email){
        makeRandomNumber();
        String setFrom = "jeawookjeong@gmail.com";
        String toMail = email;
        String title = "회원 가입 인증 이메일 입니다.";
        String content =
                "인증 번호는 " + authNumber + "입니다." +
                        "<br>" +
                        "인증번호를 제대로 입력해주세요.";
        mailSend(setFrom, toMail, title, content);
        return Integer.toString(authNumber);
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
        redisUtil.setDataExpire(Integer.toString(authNumber), toMail, 60*5L );
    }
}

