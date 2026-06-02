package com.hyra_ai.backend.repository;

import com.hyra_ai.backend.entity.WhisperTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WhisperTaskRepository extends JpaRepository<WhisperTask, String> {
    
    @Query("SELECT w FROM WhisperTask w WHERE w.user.id = :userId ORDER BY w.createAt DESC")
    List<WhisperTask> findWithResultByUserId(@Param("userId") String userId, Pageable pageable);

    List<WhisperTask> findByCreateAtBefore(java.time.LocalDateTime time);
}
