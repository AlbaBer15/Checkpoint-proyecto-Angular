package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.ProfileAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileAchievementRepository extends JpaRepository<ProfileAchievement, Long> {

    List<ProfileAchievement> findByProfileId(Long profileId); // devuelve todos los logros desbloqueados x un perfil concreto

    boolean existsByProfileIdAndAchievementId(Long profileId, Long achievementId); // comprueba si el perfil ya tiene un logro concreto

    void deleteByProfileId(Long profileId);
}
