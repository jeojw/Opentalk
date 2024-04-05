package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, Long> {
    @Query(value = "SELECT * FROM Opentalk.open_talk_member WHERE member_id=:memberId",
            nativeQuery = true)
    Optional<MemberEntity> findByMemberId(@Param("memberId") String memberId);
    @Query(value = "SELECT member_password FROM Opentalk.open_talk_member WHERE member_id=:memberId",
            nativeQuery = true
    )
    String compareByMemberPassword(@Param("memberId") String memberId);

    @Query(value = "SELECT member_id FROM Opentalk.open_talk_member WHERE member_email=:memberEmail" ,
            nativeQuery = true)
    String SearchMemberId(@Param("memberEmail") String memberEmail);

    @Query(value = "SELECT member_password FROM Opentalk.open_talk_member WHERE member_email=:memberEmail",
            nativeQuery = true)
    String SearchMemberPassword(@Param("memberEmail") String memberEmail);
    @Modifying
    @Query(value = "UPDATE Opentalk.open_talk_member SET member_password = :newPassword WHERE member_password = :exPassword",
            nativeQuery = true)
    void ChangePw(@Param("exPassword") String exPassword, @Param("newPassword") String newPassword);

    @Query(value = "SELECT member_password FROM Opentalk.open_talk_member WHERE member_email=:memberEmail",
            nativeQuery = true)
    String ReturnExPw(@Param("memberEmail") String memberEmail);

    @Modifying
    @Query(value = "UPDATE Opentalk.open_talk_member SET member_nick_name = :newNickName WHERE member_id = :memberId",
            nativeQuery = true)
    void ChangeNickName(@Param("memberId") String memberId, @Param("newNickName") String newNickName);

    boolean existsByMemberId(String memberId);

    boolean existsByMemberNickName(String memberNickName);

    boolean existsByMemberEmail(String memberEmail);
}
