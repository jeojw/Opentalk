package com.example.opentalk.repository;

import com.example.opentalk.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MainRepository extends JpaRepository<MemberEntity, Long> {
}
