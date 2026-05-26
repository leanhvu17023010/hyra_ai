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
@Table(name = "xtts_tasks")
public class XttsTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @Column(columnDefinition = "TEXT")
    String text;

    @OneToOne
    @JoinColumn(name = "speaker_wav_id")
    Media speakerWav;

    String language;

    String status; // Pending, Processing, Complete, Failed

    Integer progress;

    String resultUrl;

    LocalDateTime createAt;
}

