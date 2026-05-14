package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Genero;
import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileAchievementRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final MissionRepository missionRepository;
    private final ProfileAchievementRepository profileAchievementRepository;

    public ProfileService(ProfileRepository profileRepository, MissionRepository missionRepository, ProfileAchievementRepository profileAchievementRepository) {
        this.profileRepository = profileRepository;
        this.missionRepository = missionRepository;
        this.profileAchievementRepository = profileAchievementRepository;
    }

    public List<Profile> findAll() {
        return profileRepository.findAll();
    }

    public Profile findById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el perfil con id " + id));
    }

    public Profile create(Profile profile) {
        validarNombrePerfil(profile.getNombre());
        if (profileRepository.existsByNombre(profile.getNombre().trim())) {
            throw new IllegalArgumentException("Ya existe un perfil con ese nombre.");
        }
        profile.setNombre(profile.getNombre().trim());
        if (profile.getGenero() == null) {
            profile.setGenero(Genero.FEMENINO);
        }
        Profile savedProfile = profileRepository.save(profile);

        missionRepository.saveAll(List.of(
                misionBienvenida("⚔️ Bienvenido a Checkpoint",
                        "Completa esta misión de bienvenida para empezar tu aventura", 10, savedProfile),
                misionBienvenida("🌍 Explora tus posibilidades",
                        "Crea tu primera misión personalizada desde el formulario", 20, savedProfile),
                misionBienvenida("🔮 Primer desafío",
                        "Completa 3 misiones para subir de nivel por primera vez", 30, savedProfile)
        ));

        return savedProfile;
    }

    private Mission misionBienvenida(String titulo, String descripcion, int xp, Profile profile) {
        Mission m = new Mission();
        m.setTitulo(titulo);
        m.setDescripcion(descripcion);
        m.setXp(xp);
        m.setEstado("pendiente");
        m.setFavorito(false);
        m.setProfile(profile);
        return m;
    }

    public Profile update(Long id, Profile datos) {
        Profile profile = findById(id);
        if (datos.getNombre() != null) {
            validarNombrePerfil(datos.getNombre());
            profile.setNombre(datos.getNombre().trim());
        }
        if (datos.getAvatar() != null) {
            profile.setAvatar(datos.getAvatar());
        }
        if (datos.getGenero() != null) {
            profile.setGenero(datos.getGenero());
        }
        if (datos.getNivelMax() != null) {
            profile.setNivelMax(datos.getNivelMax());
        }
        return profileRepository.save(profile);
    }
    @Transactional
    public void delete(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe el perfil con id " + id);
        }
        profileAchievementRepository.deleteByProfileId(id);

        missionRepository.deleteByProfileId(id);

        profileRepository.deleteById(id);
    }

    private void validarNombrePerfil(String nombre) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre es obligatorio.");
        if (nombre.trim().length() <= 1)
            throw new IllegalArgumentException("El nombre debe tener al menos 1 caracter.");
        if (nombre.trim().length() >= 25)
            throw new IllegalArgumentException("El nombre no puede exceder 25 caracteres.");
    }
}