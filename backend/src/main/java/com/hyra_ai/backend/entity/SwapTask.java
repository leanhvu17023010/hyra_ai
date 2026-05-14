package com.hyra_ai.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

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

    LocalDateTime createAt;


}
