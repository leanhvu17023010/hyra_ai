package com.hyra_ai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hyra_ai.backend.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {}
