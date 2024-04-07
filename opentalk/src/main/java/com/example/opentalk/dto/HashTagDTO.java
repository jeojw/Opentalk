package com.example.opentalk.dto;

import com.example.opentalk.entity.HashTagEntity;
import lombok.*;

@Data
@Getter
@Setter
public class HashTagDTO {
    private String tagName;
    private Integer accumulate;

    @Builder
    public HashTagDTO(String tagName, Integer accumulate){
        this.tagName = tagName;
        this.accumulate = accumulate;
    }
    public static HashTagDTO toHashTagDTO(HashTagEntity hashTagEntity){
        return HashTagDTO.builder()
                .tagName(hashTagEntity.getName())
                .accumulate(hashTagEntity.getAccumulate())
                .build();
    }
}
