package com.example.opentalk.service;

import com.example.opentalk.entity.MemberEntity;
import com.example.opentalk.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override
    public UserDetailsImpl loadUserByUsername(String memberId) throws UsernameNotFoundException {
        MemberEntity member = memberRepository.findByMemberId(memberId)
                .orElseThrow(()->new UsernameNotFoundException("Can't find user with this memberId. -> " + memberId));
        if (member != null){
            return new UserDetailsImpl(member);
        }
        return null;
    }
}
