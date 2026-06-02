package com.hyra_ai.backend.repository;

import com.hyra_ai.backend.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, String> {
    
    @Query("SELECT a FROM ApiKey a JOIN FETCH a.user u JOIN FETCH u.role r WHERE a.keyValue = :keyValue")
    Optional<ApiKey> findByKeyValue(@Param("keyValue") String keyValue);
}
