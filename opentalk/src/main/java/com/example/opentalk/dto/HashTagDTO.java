package com.example.opentalk.dto;

import com.example.opentalk.entity.HashTagEntity;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
public class HashTagDTO {
    private String tagName;

    public static HashTagDTO create(String tagName){
        HashTagDTO tagDTO = new HashTagDTO();
        tagDTO.tagName = tagName;

        return tagDTO;
    }
    public static HashTagDTO toHashTagDTO(HashTagEntity hashTagEntity){
        HashTagDTO hashTagDTO = new HashTagDTO();
        hashTagDTO.setTagName(hashTagDTO.getTagName());

        return hashTagDTO;
    }
}
