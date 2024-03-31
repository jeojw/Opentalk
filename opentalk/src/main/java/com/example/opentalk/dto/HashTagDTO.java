package com.example.opentalk.dto;

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
}
