package com.example.opentalk.Config;

import com.example.opentalk.Jwt.JwtAccessDeniedHandler;
import com.example.opentalk.Jwt.JwtAuthenticationEntryPoint;
import com.example.opentalk.Jwt.JwtAuthenticationFilter;
import com.example.opentalk.Jwt.JwtTokenProvider;
import com.example.opentalk.entity.UserRole;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public BCryptPasswordEncoder encoder() {
        // 비밀번호를 DB에 저장하기 전 사용할 암호화
        return new BCryptPasswordEncoder();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // ACL(Access Control List, 접근 제어 목록)의 예외 URL 설정
        return (web)
                -> web
                .ignoring()
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations()); // 정적 리소스들
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // 인터셉터로 요청을 안전하게 보호하는 방법 설정
        http
                // jwt 토큰 사용을 위한 설정
                .csrf().disable()
                .httpBasic().disable()
                .formLogin().disable()
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 예시코드는 stateless로 적어놔서 context가 갱신되지 않았다. 근데 왜 이ㅇ렇게 했을까?
                // 예외 처리
                .and()
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint) //customEntryPoint
                .accessDeniedHandler(jwtAccessDeniedHandler) // cutomAccessDeniedHandler

                .and()
                .authorizeRequests() // '인증'이 필요하다
                .antMatchers("/opentalk/**").permitAll()
                .antMatchers("/opentalk/main",
                        "/opentalk/profile",
                        "/opentalk/room/**").authenticated()
                .antMatchers("/api/admin/**").hasRole(UserRole.ADMIN.getKey()) // 관리자 페이지
                .anyRequest().permitAll()

                .and()
                .headers()
                .frameOptions().sameOrigin();

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public Storage storage() {
        return StorageOptions.getDefaultInstance().getService();
    }

}
