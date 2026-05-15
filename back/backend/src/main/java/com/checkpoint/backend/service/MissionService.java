package com.checkpoint.backend.service;

import com.checkpoint.backend.constants.CheckpointConstants;
import com.checkpoint.backend.dto.PatchMisionDTO;
import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
            Category cat = categoryRepository.findById(mission.getCategory().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada con id " + mission.getCategory().getId()));
            mission.setCategory(cat);
        } else {
            mission.setCategory(null);
        }
        if (mission.getProfile() != null && mission.getProfile().getId() != null) {
            mission.setProfile(profileRepository.findById(mission.getProfile().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Perfil no encontrado con id " + mission.getProfile().getId())));
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

    @Transactional
    public Mission patch(Long id, PatchMisionDTO dto) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la misión con id " + id));

        validarCambios(dto);

        if (dto.getTitulo() != null) {
            mission.setTitulo(dto.getTitulo().trim());
        }
        if (dto.getDescripcion() != null) {
            mission.setDescripcion(dto.getDescripcion().trim());
        }
        if (dto.getXp() != null) {
            mission.setXp(dto.getXp());
        }
        if (dto.getEstado() != null) {
            mission.setEstado(dto.getEstado().trim().toLowerCase());
        }
        if (dto.getFavorito() != null) {
            mission.setFavorito(dto.getFavorito());
        }
        if (dto.isCategoryPresent()) {
            if (dto.getCategory() != null && dto.getCategory().getId() != null) {
                Category cat = categoryRepository.findById(dto.getCategory().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Categoría no encontrada con id " + dto.getCategory().getId()));
                mission.setCategory(cat);
            } else {
                mission.setCategory(null);
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
        if (m.getTitulo().length() < 3) {
            throw new IllegalArgumentException("El título debe tener al menos 3 caracteres.");
        }
        if (m.getTitulo().length() > 120) {
            throw new IllegalArgumentException("El título no puede exceder 120 caracteres.");
        }

        if (m.getDescripcion() == null || m.getDescripcion().isBlank()) {
            throw new IllegalArgumentException("La descripción es obligatoria.");
        }
        m.setDescripcion(m.getDescripcion().trim());
        if (m.getDescripcion().length() < 5) {
            throw new IllegalArgumentException("La descripción debe tener al menos 5 caracteres.");
        }
        if (m.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres.");
        }

        if (m.getXp() == null || m.getXp() < 1 || m.getXp() > 999) {
            throw new IllegalArgumentException("XP debe ser un número entre 1 y 999.");
        }
        if (m.getEstado() != null && !m.getEstado().isBlank()) {
            String estado = m.getEstado().trim().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estado)) {
                throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
            }
            m.setEstado(estado);
        }
    }

    private void validarCambios(PatchMisionDTO dto) {
        if (dto.getTitulo() != null) {
            if (dto.getTitulo().isBlank()) {
                throw new IllegalArgumentException("El título es obligatorio.");
            }
            if (dto.getTitulo().trim().length() < 3) {
                throw new IllegalArgumentException("El título debe tener al menos 3 caracteres.");
            }
            if (dto.getTitulo().trim().length() > 120) {
                throw new IllegalArgumentException("El título no puede exceder 120 caracteres.");
            }
        }
        if (dto.getDescripcion() != null) {
            if (dto.getDescripcion().isBlank()) {
                throw new IllegalArgumentException("La descripción es obligatoria.");
            }
            if (dto.getDescripcion().trim().length() < 5) {
                throw new IllegalArgumentException("La descripción debe tener al menos 5 caracteres.");
            }
            if (dto.getDescripcion().trim().length() > 500) {
                throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres.");
            }
        }
        if (dto.getXp() != null) {
            if (dto.getXp() < 1 || dto.getXp() > 999) {
                throw new IllegalArgumentException("XP debe ser un número entre 1 y 999.");
            }
        }
        if (dto.getEstado() != null) {
            String estado = dto.getEstado().trim().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estado)) {
                throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
            }
        }
    }
}