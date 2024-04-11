package com.example.opentalk.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManagerChangeDto {
    private String roomId;
    private String manager;
    private String newManager;
}
