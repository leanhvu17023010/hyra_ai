package com.hyra_ai.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "media")
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String fileName;
    String fileType; // IMAGE or VIDEO
    String url;
    
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
