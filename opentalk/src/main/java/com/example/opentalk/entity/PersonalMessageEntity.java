package com.example.opentalk.entity;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Getter
@Entity
@Table(name = "personal_message")
@NoArgsConstructor
public class PersonalMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String messageId;

    @Column
    private String receiver;

    @Column
    private String caller;

    @Column
    private String message;

    @Builder
    public PersonalMessageEntity(String messageId, String receiver, String caller, String message){
        this.messageId = messageId;
        this.receiver = receiver;
        this.caller = caller;
        this.message = message;
    }
}
