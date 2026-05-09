package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Genero;
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
        validarNombrePerfil(profile.getNombre());
        profile.setNombre(profile.getNombre().trim());
        if (profile.getGenero() == null) {
            profile.setGenero(Genero.FEMENINO);
        }
        return profileRepository.save(profile);
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

    public void delete(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe el perfil con id " + id);
        }
        profileRepository.deleteById(id);
    }

    private void validarNombrePerfil(String nombre) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre es obligatorio.");
        if (nombre.trim().length() < 2)
            throw new IllegalArgumentException("El nombre debe tener al menos 2 caracteres.");
        if (nombre.trim().length() > 25)
            throw new IllegalArgumentException("El nombre no puede exceder 25 caracteres.");
    }
}