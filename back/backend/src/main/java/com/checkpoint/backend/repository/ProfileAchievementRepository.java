package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.ProfileAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Acceso a base de datos para la relación entre perfiles y logros. */
public interface ProfileAchievementRepository extends JpaRepository<ProfileAchievement, Long> {

    /** Devuelve todos los logros desbloqueados por un perfil concreto. */
    List<ProfileAchievement> findByProfileId(Long profileId);

    /** Comprueba si un perfil ya tiene un logro concreto (para evitar duplicados). */
    boolean existsByProfileIdAndAchievementId(Long profileId, Long achievementId);

    /** Elimina todos los logros desbloqueados de un perfil. */
    void deleteByProfileId(Long profileId);
}
