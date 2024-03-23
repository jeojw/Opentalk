package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberEntity;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
    Optional<MemberEntity> findByMemberId(String memberId);
    @Query(value = "SELECT member_password" +
            "FROM Opentalk.open_talk_member" +
            "WHERE member_id=:memberId", nativeQuery = true
    )
    boolean compareByMemberPassword(@Param(value="memberId") String memberId, String memberPassword);

    @Query(value = "SELECT member_id" +
            "FROM Opentalk.open_talk_member" +
            "WHERE member_email=:memberEmail" , nativeQuery = true)
    String SearchId(String memberEmail);

//    @Query(value = "UPDATE Opentalk.open_talk_member" +
//            "SET member_password = :newPassword" +
//            "WHERE member_id = :memberId")
//    String ChangePw(String memberId, String newPassword);

    boolean existsByMemberId(String memberId);
    boolean existsByMemberNickName(String memberNickName);
    boolean existsByMemberEmail(String memberEmail);
}
