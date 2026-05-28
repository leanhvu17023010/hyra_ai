package com.hyra_ai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "whisper_tasks")
public class WhisperTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @OneToOne
    @JoinColumn(name = "audio_media_id")
    Media audioMedia;

    String status; // Pending, Processing, Complete, Failed

    Integer progress;

    String resultTxtUrl;
    String resultSrtUrl;

    LocalDateTime createAt;
}
