package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Acceso a base de datos para misiones.
 */
public interface MissionRepository extends JpaRepository<Mission, Long> {

    /**
     * Cuenta las misiones con el estado indicado (sin filtro de perfil).
     */
    Long countByEstado(String estado);

    /**
     * Suma el XP de todas las misiones con el estado indicado.
     * Devuelve 0 en lugar de {@code null} si no hay resultados (COALESCE).
     */
    @Query("SELECT COALESCE(SUM(m.xp), 0) FROM Mission m WHERE m.estado = :estado")
    Long sumXpByEstado(@Param("estado") String estado);

    /**
     * Devuelve todas las misiones asociadas a un perfil concreto.
     */
    List<Mission> findByProfileId(Long profileId);

    /**
     * Elimina todas las misiones de un perfil (cascade).
     */
    void deleteByProfileId(Long profileId);

    /**
     * Suma el XP de las misiones de un perfil concreto con el estado marcado.
     * Devuelve 0 si no hay resultados (COALESCE).
     */
    @Query("SELECT COALESCE(SUM(m.xp), 0) FROM Mission m WHERE m.estado = :estado AND m.profile.id = :profileId")
    Long sumXpByEstadoAndProfileId(@Param("estado") String estado, @Param("profileId") Long profileId);

    /**
     * Cuenta las misiones de un perfil concreto con el estado marcado.
     */
    @Query("SELECT COUNT(m) FROM Mission m WHERE m.estado = :estado AND m.profile.id = :profileId")
    Long countByEstadoAndProfileId(@Param("estado") String estado, @Param("profileId") Long profileId);

}