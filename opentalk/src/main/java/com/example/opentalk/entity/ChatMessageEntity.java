package com.example.opentalk.entity;

import lombok.Getter;

import javax.persistence.*;

@Getter
@Entity
@Table(name = "chat_log")
public class ChatMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomId;

    @Column(nullable = false)
    private String writer;

    @Column(nullable = false)
    private String message;
}
