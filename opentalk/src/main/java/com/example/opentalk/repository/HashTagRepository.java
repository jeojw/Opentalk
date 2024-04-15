package com.example.opentalk.repository;

import com.example.opentalk.entity.HashTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface HashTagRepository extends JpaRepository<HashTagEntity, Long> {

    @Query(value = "SELECT tag_name FROM Opentalk.hashtag", nativeQuery = true)
    List<String> findAllTags();

    @Query(value = "SELECT id FROM Opentalk.hashtag WHERE tag_name = :tagName", nativeQuery = true)
    Optional<Long> returnTagId(@Param("tagName") String tagName);

    @Modifying
    @Transactional
    @Query(value = "UPDATE Opentalk.hashtag SET tag_accumulate = tag_accumulate + 1 WHERE id = :tag_id",
            nativeQuery = true)
    void accumulateTag(@Param("tag_id") Long tag_id);
}
