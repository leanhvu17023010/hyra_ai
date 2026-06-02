package com.hyra_ai.backend.repository;

import com.hyra_ai.backend.entity.XttsTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface XttsTaskRepository extends JpaRepository<XttsTask, String> {

    @Query("SELECT t FROM XttsTask t WHERE t.user.id = :userId AND t.resultUrl IS NOT NULL "
            + "AND TRIM(t.resultUrl) <> '' ORDER BY t.createAt DESC")
    List<XttsTask> findWithResultByUserId(@Param("userId") String userId, Pageable pageable);

    List<XttsTask> findByCreateAtBefore(java.time.LocalDateTime time);
}
