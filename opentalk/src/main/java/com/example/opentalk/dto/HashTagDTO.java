package com.example.opentalk.dto;

import com.example.opentalk.entity.ChatRoomHashtagEntity;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
public class HashTagDTO {
    private String tagName;
    private Integer accumulate;

    @Builder
    public HashTagDTO(String tagName, Integer accumulate){
        this.tagName = tagName;
        this.accumulate = accumulate;
    }
    public static HashTagDTO toHashTagDTO(ChatRoomHashtagEntity hashTagEntity){
        return HashTagDTO.builder()
                .tagName(hashTagEntity.getHashtag().getName())
                .accumulate(hashTagEntity.getHashtag().getAccumulate())
                .build();
    }
}
