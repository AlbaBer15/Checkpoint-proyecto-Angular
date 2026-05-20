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

/**
 * Lógica de negocio : gestionar logros.
 * Usa Bean Validation ({@code @NotBlank}, {@code @Size}, {@code @Min} en la entidad
 *  {@code @Valid} en el controller) en vez de validación manual,
 * para documentar ambos enfoques en el proyecto.
 */
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

    /** Muestra todos los logros disponibles. */
    public List<Achievement> findAll() {
        return achievementRepository.findAll();
    }

    /**
     * Añade un nuevo logro.
     * La validación de campos se ejecuta gracias a las anotaciones de la entidad
     * ({@code @NotBlank}, {@code @Size}, {@code @Min}) activas gracias a {@code @Valid} en el controller.
     *
     * @param achievement datos del logro que creamos
     * @return logro con ID creado
     */
    public Achievement create(Achievement achievement) {
        achievement.setTitulo(achievement.getTitulo().trim());
        return achievementRepository.save(achievement);
    }

    /**
     * Devuelve los logros desbloqueados según el perfil seleccionado.
     * @param profileId ID del perfil
     * @return lista de registros desbloqueados, estará vacia si no ha conseguido ninguno
     */
    public List<ProfileAchievement> findByProfile(Long profileId) {
        return profileAchievementRepository.findByProfileId(profileId);
    }

    /**
     * Registra que un perfil ha desbloqueado un logro.
     * Lanza una excepción si el logro ya estaba desbloqueado para ese perfil,
     * asi evitamos las duplicidades en la tabla intermedia.
     *
     * @param profileId : ID del perfil
     * @param achievementId : ID del logro
     * @return registro de desbloqueos
     * @throws IllegalArgumentException cuando el logro estaba desbloqueado
     * @throws ResourceNotFoundException si el perfil o el logro no existen
     */
    public ProfileAchievement unlock(Long profileId, Long achievementId) {
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