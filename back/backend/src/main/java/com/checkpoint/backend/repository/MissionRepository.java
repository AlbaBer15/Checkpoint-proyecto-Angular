package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MissionRepository extends JpaRepository<Mission, Long> {
}