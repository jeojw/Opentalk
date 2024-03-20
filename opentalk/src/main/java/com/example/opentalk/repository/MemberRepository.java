package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
    Optional<MemberEntity> findByMemberId(String memberId);
    boolean existsByMemberId(String memberId);
    boolean existsByMemberNickName(String memberNickName);
    boolean existsByMemberEmail(String memberEmail);
}
