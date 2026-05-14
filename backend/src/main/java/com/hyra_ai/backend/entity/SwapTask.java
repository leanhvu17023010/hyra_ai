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
@Table(name = "swap_tasks")
public class SwapTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    User user;

    @OneToOne
    Media sourceImage;

    @OneToOne
    Media sourceVideo;

    String status; // thể hiện các trạng thái peding, processing,complete

    String resultUrl;

    LocalDateTime createAt;


}
