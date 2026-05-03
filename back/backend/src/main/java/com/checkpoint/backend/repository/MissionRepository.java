package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    Long countByEstado(String estado);

    @Query("SELECT COALESCE(SUM(m.xp), 0) FROM Mission m WHERE m.estado = :estado")
    Long sumXpByEstado(@Param("estado") String estado);
}