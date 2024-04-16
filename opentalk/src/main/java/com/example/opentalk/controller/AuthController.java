package com.example.opentalk.controller;

import com.example.opentalk.dto.AuthDto;
import com.example.opentalk.service.AuthService;
import com.example.opentalk.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final MemberService memberService;
    private final BCryptPasswordEncoder encoder;

    private final long COOKIE_EXPIRATION = 7776000; // 90일

    @PostMapping("/api/opentalk/auth/signup")
    public ResponseEntity<Void> signup(@RequestBody @Valid AuthDto.SignupDto signupDto){
        String encodedPassword = encoder.encode(signupDto.getMemberPassword());
        AuthDto.SignupDto newSignupDto = AuthDto.SignupDto.encodePassword(signupDto, encodedPassword);

        memberService.singUp(newSignupDto);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/api/opentalk/auth/login")
    public ResponseEntity<?> login(@RequestBody @Valid AuthDto.LoginDto loginDto) {
        // User 등록 및 Refresh Token 저장
        AuthDto.TokenDto tokenDto = authService.login(loginDto);

        // RT 저장
        HttpCookie httpCookie = ResponseCookie.from("refresh-token", tokenDto.getRefreshToken())
                .maxAge(COOKIE_EXPIRATION)
                .httpOnly(true)
                .secure(true)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, httpCookie.toString())
                // AT 저장
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenDto.getAccessToken())
                .build();
    }

    @PostMapping("/api/opentalk/auth/validate")
    public ResponseEntity<?> validate(@RequestHeader("Authorization") String requestAccessToken) {
        if (!authService.validate(requestAccessToken)) {
            return ResponseEntity.status(HttpStatus.OK).build(); // 재발급 필요X
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 재발급 필요
        }
    }

    // 토큰 재발급
    @PostMapping("/api/opentalk/auth/reissue")
    public ResponseEntity<?> reissue(@CookieValue(name = "refresh-token") String requestRefreshToken,
                                     @RequestHeader("Authorization") String requestAccessToken) {
        AuthDto.TokenDto reissuedTokenDto = authService.reissue(requestAccessToken, requestRefreshToken);

        if (reissuedTokenDto != null) { // 토큰 재발급 성공
            // RT 저장
            ResponseCookie responseCookie = ResponseCookie.from("refresh-token", reissuedTokenDto.getRefreshToken())
                    .maxAge(COOKIE_EXPIRATION)
                    .httpOnly(true)
                    .secure(true)
                    .build();
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                    // AT 저장
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + reissuedTokenDto.getAccessToken())
                    .build();

        } else { // Refresh Token 탈취 가능성
            // Cookie 삭제 후 재로그인 유도
            ResponseCookie responseCookie = ResponseCookie.from("refresh-token", "")
                    .maxAge(0)
                    .path("/")
                    .build();
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                    .build();
        }
    }

    // 로그아웃
    @PostMapping("/api/opentalk/auth/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String requestAccessToken) {
        authService.logout(requestAccessToken);
        ResponseCookie responseCookie = ResponseCookie.from("refresh-token", "")
                .maxAge(0)
                .path("/")
                .build();

        return ResponseEntity
                .status(HttpStatus.OK)
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .build();
    }

    @PostMapping("/api/opentalk/auth/signup/checkId")
    public ResponseEntity<Boolean> checkDuplicateId(@RequestParam("memberId") String memberId){
        return ResponseEntity.ok(authService.checkDuplicateId(memberId));
    }

    @PostMapping("/api/opentalk/auth/signup/checkNickName")
    public ResponseEntity<Boolean> checkDuplicateNickName(@RequestParam("memberNickName") String memberNickName){
        return ResponseEntity.ok(authService.checkDuplicateNickName(memberNickName));
    }

    @PostMapping("/api/opentalk/auth/signup/checkEmail")
    public ResponseEntity<Boolean> checkDuplicateEmail(@RequestParam("memberEmail") String memberEmail){
        return ResponseEntity.ok(authService.checkDuplicateEmail(memberEmail));
    }

    @PostMapping("/api/opentalk/auth/checkId")
    public ResponseEntity<Boolean> authId(@RequestParam("memberId") String memberId){
        return ResponseEntity.ok(authService.authId(memberId));
    }

    @PostMapping("/api/opentalk/auth/exPassword")
    public ResponseEntity<String> getExPassword(@RequestParam("memberEmail") String memberEmail){
        return ResponseEntity.ok(authService.getExPassword(memberEmail));
    }

    @PostMapping("/api/opentalk/auth/changePassword")
    public void changePassword(@RequestParam("memberEmail") String memberEmail,
                               @RequestParam("newPassword") String newPassword){
        authService.changePassword(memberEmail, newPassword);
    }
}
