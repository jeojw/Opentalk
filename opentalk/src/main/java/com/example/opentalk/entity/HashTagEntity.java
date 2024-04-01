package com.example.opentalk.entity;

import com.example.opentalk.dto.HashTagDTO;
import com.example.opentalk.dto.MemberDTO;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "tag")
@NoArgsConstructor
public class HashTagEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long id;

    @Column(name = "tag_name", nullable = false)
    private String name;

    @Builder
    public HashTagEntity(Long id, String name){
        this.id = id;
        this.name = name;
    }

    public static HashTagEntity toHashTagEntity(HashTagDTO hashTagDTO){
        HashTagEntity hashTagEntity = HashTagEntity.builder()
                .name(hashTagDTO.getTagName())
                .build();

        return hashTagEntity;
    }
}
