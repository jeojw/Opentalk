package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberInviteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberInviteRepository extends JpaRepository<MemberInviteEntity, Long> {
}
