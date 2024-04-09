package com.example.opentalk.repository;

import com.example.opentalk.entity.HashTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface HashTagRepository extends JpaRepository<HashTagEntity, Long> {

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.hashtag SET tag_accumulate = tag_accumulate + 1 WHERE tag_id = :tag_id",
            nativeQuery = true)
    int accumulateTag(@Param("tag_id") Long tag_id);
}
