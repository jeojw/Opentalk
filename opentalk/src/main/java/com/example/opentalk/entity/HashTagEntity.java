package com.example.opentalk.entity;

import com.example.opentalk.dto.HashTagDTO;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "hashtag")
@NoArgsConstructor
public class HashTagEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long id;

    @Column(name = "tag_name", nullable = false, unique = true)
    private String name;

    @Column(name = "tag_accumulate")
    private Integer accumulate;

    @OneToMany(mappedBy = "hashtag", cascade = CascadeType.PERSIST)
    private List<ChatRoomHashtagEntity> chatRooms = new ArrayList<>();

    @Builder
    public HashTagEntity(String name, Integer accumulate){
        this.name = name;
        this.accumulate = accumulate;
    }

    public static HashTagEntity toHashTagEntity(HashTagDTO hashTagDTO){
        return HashTagEntity.builder()
                .name(hashTagDTO.getTagName())
                .accumulate(hashTagDTO.getAccumulate())
                .build();
    }
}
