package com.hyra_ai.backend.repository;

import com.hyra_ai.backend.entity.SwapTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDateTime;

public interface SwapTaskRepository extends JpaRepository<SwapTask, String> {

    @Query(
            "SELECT t FROM SwapTask t WHERE t.user.id = :userId AND t.resultUrl IS NOT NULL "
                    + "AND TRIM(t.resultUrl) <> '' ORDER BY t.createAt DESC")
    List<SwapTask> findWithResultByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT t FROM SwapTask t WHERE t.createAt < :date AND (t.status IS NULL OR t.status <> :status)")
    List<SwapTask> findByCreateAtBeforeAndStatusNot(@Param("date") LocalDateTime date, @Param("status") String status);

    List<SwapTask> findByCreateAtBefore(LocalDateTime createAt);
}
