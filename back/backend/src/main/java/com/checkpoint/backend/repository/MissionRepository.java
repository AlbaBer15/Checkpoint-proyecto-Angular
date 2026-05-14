package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    Long countByEstado(String estado);

    @Query("SELECT COALESCE(SUM(m.xp), 0) FROM Mission m WHERE m.estado = :estado")
    Long sumXpByEstado(@Param("estado") String estado);

    List<Mission> findByProfileId(Long profileId);

    void deleteByProfileId(Long profileId);

    @Query("SELECT COALESCE(SUM(m.xp), 0) FROM Mission m WHERE m.estado = :estado AND m.profile.id = :profileId")
    Long sumXpByEstadoAndProfileId(@Param("estado") String estado, @Param("profileId") Long profileId);

    @Query("SELECT COUNT(m) FROM Mission m WHERE m.estado = :estado AND m.profile.id = :profileId")
    Long countByEstadoAndProfileId(@Param("estado") String estado, @Param("profileId") Long profileId);

}