package com.checkpoint.backend.service;

import com.checkpoint.backend.constants.CheckpointConstants;
import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MissionService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            CheckpointConstants.ESTADO_PENDIENTE,
            CheckpointConstants.ESTADO_COMPLETADA
    );

    private final MissionRepository missionRepository;
    private final CategoryRepository categoryRepository;
    private final ProfileRepository profileRepository;

    public MissionService(
            MissionRepository missionRepository,
            CategoryRepository categoryRepository,
            ProfileRepository profileRepository) {
        this.missionRepository = missionRepository;
        this.categoryRepository = categoryRepository;
        this.profileRepository = profileRepository;
    }

    public List<Mission> findAll() {
        return missionRepository.findAll();
    }

    public List<Mission> findByProfile(Long profileId) {
        return missionRepository.findByProfileId(profileId);
    }

    public Mission create(Mission mission) {
        normalizarYValidar(mission);

        if (mission.getFavorito() == null) {
            mission.setFavorito(false);
        }
        if (mission.getEstado() == null || mission.getEstado().isBlank()) {
            mission.setEstado(CheckpointConstants.ESTADO_PENDIENTE);
        }
        if (mission.getCategory() != null && mission.getCategory().getId() != null) {
            categoryRepository.findById(mission.getCategory().getId())
                    .ifPresent(mission::setCategory);
        }
        if (mission.getProfile() != null && mission.getProfile().getId() != null) {
            profileRepository.findById(mission.getProfile().getId())
                    .ifPresent(mission::setProfile);
        }
        return missionRepository.save(mission);
    }

    public void delete(Long id) {
        if (!missionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la misión con id " + id);
        }
        missionRepository.deleteById(id);
    }

    public Mission findById(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe la misión con id " + id
                ));
    }

    public Mission patch(Long id, Map<String, Object> changes) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la misión con id " + id));

        validarCambios(changes);

        if (changes.containsKey("titulo")) {
            mission.setTitulo(changes.get("titulo").toString().trim());
        }
        if (changes.containsKey("descripcion")) {
            mission.setDescripcion(changes.get("descripcion").toString().trim());
        }
        if (changes.containsKey("xp")) {
            mission.setXp(Integer.parseInt(changes.get("xp").toString()));
        }
        if (changes.containsKey("estado")) {
            Object v = changes.get("estado");
            if (v != null) {
                mission.setEstado(v.toString().trim().toLowerCase());
            }
        }
        if (changes.containsKey("favorito")) {
            Object v = changes.get("favorito");
            if (v instanceof Boolean b) {
                mission.setFavorito(b);
            } else if (v != null) {
                mission.setFavorito(Boolean.parseBoolean(v.toString()));
            }
        }

        return missionRepository.save(mission);
    }

    public Long getTotalXP(Long profileId) {
        if (profileId != null) {
            return missionRepository.sumXpByEstadoAndProfileId(
                    CheckpointConstants.ESTADO_COMPLETADA, profileId);
        }
        return missionRepository.sumXpByEstado(CheckpointConstants.ESTADO_COMPLETADA);
    }

    public Long getActiveMissionsCount(Long profileId) {
        if (profileId != null) {
            return missionRepository.countByEstadoAndProfileId(
                    CheckpointConstants.ESTADO_PENDIENTE, profileId);
        }
        return missionRepository.countByEstado(CheckpointConstants.ESTADO_PENDIENTE);
    }

    private void normalizarYValidar(Mission m) {
        if (m == null) {
            throw new IllegalArgumentException("La misión no puede ser null.");
        }
        if (m.getTitulo() == null || m.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título es obligatorio.");
        }
        m.setTitulo(m.getTitulo().trim());

        if (m.getDescripcion() == null || m.getDescripcion().isBlank()) {
            throw new IllegalArgumentException("La descripción es obligatoria.");
        }
        m.setDescripcion(m.getDescripcion().trim());

        if (m.getXp() == null || m.getXp() < 1 || m.getXp() > 999) {
            throw new IllegalArgumentException("XP debe ser un número entre 1 y 999.");
        }
        if (m.getTitulo().length() > 120) {
            throw new IllegalArgumentException("Título no puede exceder 120 caracteres.");
        }
        if (m.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("Descripción no puede exceder 500 caracteres.");
        }
        if (m.getEstado() != null && !m.getEstado().isBlank()) {
            String estado = m.getEstado().trim().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estado)) {
                throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
            }
            m.setEstado(estado);
        }
    }

    private void validarCambios(Map<String, Object> changes) {
        if (changes.containsKey("titulo")) {
            Object v = changes.get("titulo");
            if (v == null || v.toString().isBlank()) {
                throw new IllegalArgumentException("El título es obligatorio.");
            }
            if (v.toString().trim().length() < 3) {
                throw new IllegalArgumentException("El título debe tener al menos 3 caracteres.");
            }
            if (v.toString().trim().length() > 120) {
                throw new IllegalArgumentException("El título no puede exceder 120 caracteres.");
            }
        }
        if (changes.containsKey("descripcion")) {
            Object v = changes.get("descripcion");
            if (v == null || v.toString().isBlank()) {
                throw new IllegalArgumentException("La descripción es obligatoria.");
            }
            if (v.toString().trim().length() < 5) {
                throw new IllegalArgumentException("La descripción debe tener al menos 5 caracteres.");
            }
            if (v.toString().trim().length() > 500) {
                throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres.");
            }
        }
        if (changes.containsKey("xp")) {
            Object v = changes.get("xp");
            if (v == null) {
                throw new IllegalArgumentException("XP es obligatorio.");
            }
            int xp;
            try {
                xp = Integer.parseInt(v.toString());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("XP debe ser un número válido.");
            }
            if (xp < 1 || xp > 999) {
                throw new IllegalArgumentException("XP debe ser un número entre 1 y 999.");
            }
        }
        if (changes.containsKey("estado")) {
            Object v = changes.get("estado");
            if (v != null) {
                String estado = v.toString().trim().toLowerCase();
                if (!ESTADOS_VALIDOS.contains(estado)) {
                    throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
                }
            }
        }
    }
}