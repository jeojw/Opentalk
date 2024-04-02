package com.example.opentalk.repository;

import com.example.opentalk.entity.HashTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HashTagRepository extends JpaRepository<HashTagEntity, Long> {
}
