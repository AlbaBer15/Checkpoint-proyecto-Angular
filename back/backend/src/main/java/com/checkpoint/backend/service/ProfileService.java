package com.checkpoint.backend.service;

import com.checkpoint.backend.constants.CheckpointConstants;
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

/**
 * Lógica de negocio : gestionar perfiles.
 * Al crear un perfil se generan automáticamente 3 misiones de bienvenida
 * La eliminación de un perfil borra manualmente sus
 * logros y sus misiones.
 */
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

    /** Devuelve todos los perfiles existentes. */
    public List<Profile> findAll() {
        return profileRepository.findAll();
    }

    /**
     * Busca un perfil por su ID.
     *
     * @param id ID del perfil
     * @return el perfil encontrado
     * @throws ResourceNotFoundException cuando no existe el perfil
     */
    public Profile findById(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe el perfil con id " + id));
    }

    /**
     * Crea un nuevo perfil y sus 3 misiones de bienvenida.
     * Toda la operación se ejecuta en una única transacción: si falla la creación
     * de las misiones el perfil no se crea.
     * Si no se indica género, se asigna {@code FEMENINO} por defecto.
     *
     * @param profile datos del perfil a crear
     * @return perfil con ID generado
     * @throws IllegalArgumentException si el nombre es inválido o ya existe
     */
    @Transactional
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

    /** Crea la misión de bienvenida sin categoría asignada al perfil. */
    private Mission misionBienvenida(String titulo, String descripcion, int xp, Profile profile) {
        Mission m = new Mission();
        m.setTitulo(titulo);
        m.setDescripcion(descripcion);
        m.setXp(xp);
        m.setEstado(CheckpointConstants.ESTADO_PENDIENTE);
        m.setFavorito(false);
        m.setProfile(profile);
        return m;
    }

    /**
     * Actualiza los campos a editar de un perfil existente.
     * Solo se modifican los campos con valor del objeto
     * Si el nombre cambia, se comprueba que no exista ya otro perfil con ese nombre.
     *
     * @param id    ID del perfil para actualizar
     * @param datos campos nuevos (los null se ignoran)
     * @return perfil actualizado
     * @throws ResourceNotFoundException excepcion cuando el perfil no existe
     * @throws IllegalArgumentException excepcion si el nuevo nombre esta duplicado o es inválido
     */
    public Profile update(Long id, Profile datos) {
        Profile profile = findById(id);
        if (datos.getNombre() != null) {
            validarNombrePerfil(datos.getNombre());
            String nombreNuevo = datos.getNombre().trim();
            if (!nombreNuevo.equals(profile.getNombre()) && profileRepository.existsByNombre(nombreNuevo)) {
                throw new IllegalArgumentException("Ya existe un perfil con ese nombre.");
            }
            profile.setNombre(nombreNuevo);
        }
        if (datos.getAvatar() != null) {
            profile.setAvatar(datos.getAvatar());
        }
        if (datos.getGenero() != null) {
            profile.setGenero(datos.getGenero());
        }
        return profileRepository.save(profile);
    }
    /**
     * Elimina un perfil y sus datos relacionados.
     * Orden de borrado: logros desbloqueados - misiones y por ultimo perfil.
     * Este orden respeta las restricciones de FK evitando el borrado en cascada.
     *
     * @param id ID del perfil a eliminar
     * @throws ResourceNotFoundException cuando el perfil no existe
     */
    @Transactional
    public void delete(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe el perfil con id " + id);
        }
        profileAchievementRepository.deleteByProfileId(id);

        missionRepository.deleteByProfileId(id);

        profileRepository.deleteById(id);
    }

    /**
     * Valida el nombre de perfil: comprobamos que no esta vacío y máximo 25 caracteres.
     *
     * @throws IllegalArgumentException excepcion cuando el nombre no cumple las validaciones
     */
    private void validarNombrePerfil(String nombre) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre es obligatorio.");
        String trimmed = nombre.trim();
        if (trimmed.length() > CheckpointConstants.MAX_NOMBRE_PERFIL)
            throw new IllegalArgumentException("El nombre no puede exceder " + CheckpointConstants.MAX_NOMBRE_PERFIL + " caracteres.");
    }
}