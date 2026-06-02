package com.hyra_ai.backend.repository;

import com.hyra_ai.backend.entity.MegaTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MegaTaskRepository extends JpaRepository<MegaTask, String> {
    java.util.List<MegaTask> findByCreatedAtBefore(java.time.LocalDateTime time);
}
