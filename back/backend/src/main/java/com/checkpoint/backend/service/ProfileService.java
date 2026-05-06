package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<Profile> findAll() {
        return profileRepository.findAll();
    }

    public Profile findById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el perfil con id " + id));
    }

    public Profile create(Profile profile) {
        if (profile.getNombre() == null || profile.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del perfil es obligatorio.");
        }
        profile.setNombre(profile.getNombre().trim());
        return profileRepository.save(profile);
    }

    public Profile update(Long id, Profile datos) {
        Profile profile = findById(id);
        if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
            profile.setNombre(datos.getNombre().trim());
        }
        if (datos.getAvatar() != null) {
            profile.setAvatar(datos.getAvatar());
        }
        if (datos.getNivelMax() != null) {
            profile.setNivelMax(datos.getNivelMax());
        }
        return profileRepository.save(profile);
    }

    public void delete(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe el perfil con id " + id);
        }
        profileRepository.deleteById(id);
    }
}