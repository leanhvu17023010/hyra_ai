package com.hyra_ai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hyra_ai.backend.entity.Media;

@Repository
public interface MediaRepository extends JpaRepository<Media, String> {
}
