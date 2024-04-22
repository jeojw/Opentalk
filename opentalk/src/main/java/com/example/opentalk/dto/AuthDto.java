package com.example.opentalk.dto;

import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.entity.UserRole;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class LoginDto {
        private String memberId;
        private String memberPassword;

        @Builder
        public LoginDto(String memberId, String memberPassword) {
            this.memberId = memberId;
            this.memberPassword = memberPassword;
        }
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class ResponseDto{
        private String memberId;
        private String memberNickName;
        private String memberName;
        private String memberEmail;
        private String imgUrl;

        @Builder
        public ResponseDto(String memberId, String memberNickName,
                           String memberName, String memberEmail,
                           String imgUrl){
            this.memberId = memberId;
            this.memberNickName = memberNickName;
            this.memberName = memberName;
            this.memberEmail = memberEmail;
            this.imgUrl = imgUrl;
        }

        public static ResponseDto toResponse(MemberEntity member){
            return ResponseDto.builder()
                    .memberId(member.getMemberId())
                    .memberNickName(member.getMemberNickName())
                    .memberName(member.getMemberName())
                    .memberEmail(member.getMemberEmail())
                    .imgUrl(member.getImgUrl())
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class SignupDto {
        private String memberId;
        private String memberPassword;
        private String memberEmail;
        private String memberName;
        private String memberNickName;
        private String imgUrl;
        private UserRole authority;

        @Builder
        public SignupDto(String memberId, String memberPassword,
                         String memberEmail, String memberName,
                         String memberNickName, String imgUrl,
                         UserRole authority) {
            this.memberId = memberId;
            this.memberPassword = memberPassword;
            this.memberEmail = memberEmail;
            this.memberName = memberName;
            this.memberNickName = memberNickName;
            this.imgUrl = imgUrl;
            this.authority = authority;
        }

        public static SignupDto encodePassword(SignupDto signupDto, String encodedPassword) {
            return SignupDto.builder()
                    .memberId(signupDto.memberId)
                    .memberPassword(encodedPassword)
                    .memberEmail(signupDto.memberEmail)
                    .memberName(signupDto.memberName)
                    .memberNickName(signupDto.memberNickName)
                    .imgUrl(signupDto.imgUrl)
                    .authority(UserRole.USER)
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public static class TokenDto {
        private String accessToken;
        private String refreshToken;

        public TokenDto(String accessToken, String refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
        }
    }
}
