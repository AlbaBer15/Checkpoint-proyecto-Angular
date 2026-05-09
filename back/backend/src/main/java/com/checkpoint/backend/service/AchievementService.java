package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Achievement;
import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.entity.ProfileAchievement;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.AchievementRepository;
import com.checkpoint.backend.repository.ProfileAchievementRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final ProfileAchievementRepository profileAchievementRepository;
    private final ProfileRepository profileRepository;

    public AchievementService(
            AchievementRepository achievementRepository,
            ProfileAchievementRepository profileAchievementRepository,
            ProfileRepository profileRepository) {
        this.achievementRepository = achievementRepository;
        this.profileAchievementRepository = profileAchievementRepository;
        this.profileRepository = profileRepository;
    }

    public List<Achievement> findAll() {
        return achievementRepository.findAll();
    }

    public Achievement create(Achievement achievement) {
        if (achievement.getTitulo() == null || achievement.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título del logro es obligatorio.");
        }
        achievement.setTitulo(achievement.getTitulo().trim());
        return achievementRepository.save(achievement);
    }

    // Logros desbloqueados por un perfil
    public List<ProfileAchievement> findByProfile(Long profileId) {
        return profileAchievementRepository.findByProfileId(profileId);
    }

    // Desbloquear un logro para un perfil
    public ProfileAchievement unlock(Long profileId, Long achievementId) {

        // Comprobar que no lo tenga ya
        if (profileAchievementRepository.existsByProfileIdAndAchievementId(profileId, achievementId)) {
            throw new IllegalArgumentException("Este logro ya está desbloqueado.");
        }

        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el perfil con id " + profileId));

        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el logro con id " + achievementId));

        ProfileAchievement pa = new ProfileAchievement();
        pa.setProfile(profile);
        pa.setAchievement(achievement);

        return profileAchievementRepository.save(pa);
    }
}