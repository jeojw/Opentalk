package com.example.opentalk.entity;

import lombok.Builder;
import lombok.Getter;

import javax.persistence.*;

@Getter
@Entity
@Table(name = "alarm_message")
public class AlarmMessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String messageId;

    @Column(nullable = false)
    private String memberNickName;

    @Enumerated(EnumType.STRING)
    private AlarmType alarmType;

    @Column(nullable = false)
    private String alarmMessage;

    public AlarmMessageEntity() {}

    @Builder
    private AlarmMessageEntity(String messageId, String memberNickName, AlarmType alarmType, String alarmMessage){
        this.messageId = messageId;
        this.memberNickName = memberNickName;
        this.alarmType = alarmType;
        this.alarmMessage = alarmMessage;
    }
}
