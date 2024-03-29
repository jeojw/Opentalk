package com.example.opentalk.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;

@Getter
@Setter
public class EmailRequestDTO {
    @Email
    @NotEmpty(message="이메일을 입력해 주세요.")
    private String email;

    @NotEmpty(message="타입을 입력해 주세요.")
    private String sendType;
}
