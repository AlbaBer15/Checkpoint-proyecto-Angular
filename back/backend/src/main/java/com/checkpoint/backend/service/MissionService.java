package com.checkpoint.backend.service;

import com.checkpoint.backend.constants.CheckpointConstants;
import com.checkpoint.backend.dto.PatchMisionDTO;
import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Lógica de negocio: gestionar misiones.
 * Aplica validación manual sobre los datos,
 * se aplica trim antes de persistir para evitar errores
 * y manejamos relación entre categoria y perfil.
 */
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

    /**
     * Devuelve todas las misiones de la base de datos sin filtro.
     */
    public List<Mission> findAll() {
        return missionRepository.findAll();
    }

    /**
     * Devuelve las misiones asociadas al perfil seleccionado.
     *
     * @param profileId ID del perfil asignado
     * @return lista de misiones del perfil, vacía si no tiene ninguna
     */
    public List<Mission> findByProfile(Long profileId) {
        return missionRepository.findByProfileId(profileId);
    }

    /**
     * Crea una nueva misión.
     * Si {@code favorito} o {@code estado} llegan como {@code null} se asignan
     * los valores por defecto ({@code false} y {@code "pendiente"}).
     * Si se incluye categoría o perfil se verifica en base de datos.
     *
     * @param mission datos de la misión a crear
     * @return misión con su ID generado
     * @throws ResourceNotFoundException si la categoría o perfil seleccionados no existen
     * @throws IllegalArgumentException  si los datos no pasan la validación
     */
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

    /**
     * Elimina una misión por su ID.
     *
     * @param id ID de la misión a eliminar
     * @throws ResourceNotFoundException si no existe
     */
    public void delete(Long id) {
        if (!missionRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la misión con id " + id);
        }
        missionRepository.deleteById(id);
    }

    /**
     * Busca una misión por su ID.
     *
     * @param id ID de la misión
     * @return la misión encontrada
     * @throws ResourceNotFoundException si no existe
     */
    public Mission findById(Long id) {
        return missionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe la misión con id " + id
                ));
    }

    /**
     * Actualiza partes de una misión usando DTO.
     * Solo se aplican los campos CON valor del DTO. La categoría es un caso
     * especial: {@code categoryPresent=true} con {@code category=null} borra la
     * categoría, mientras que si {@code categoryPresent=false} el campo se ignora.
     *
     * @param id  ID de la misión para actualizar
     * @param dto campos a modificar
     * @return misión actualizada
     * @throws ResourceNotFoundException cuando la misión o la nueva categoría no existan
     * @throws IllegalArgumentException  cuando los nuevos valores no pasan la validación
     */
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

    /**
     * Calcula el XP total acumulado de misiones completadas.
     *
     * @param profileId ID del perfil para filtrar. Si es null suma todas las misiones completadas
     * @return XP total (0 si no hay misiones completadas)
     */
    public Long getTotalXP(Long profileId) {
        if (profileId != null) {
            return missionRepository.sumXpByEstadoAndProfileId(
                    CheckpointConstants.ESTADO_COMPLETADA, profileId);
        }
        return missionRepository.sumXpByEstado(CheckpointConstants.ESTADO_COMPLETADA);
    }

    /**
     * Cuenta las misiones en estado {@code "pendiente"}.
     *
     * @param profileId ID del perfil para filtrar. Cuando sea null cuenta todas las pendientes
     * @return número de misiones pendientes
     */
    public Long getActiveMissionsCount(Long profileId) {
        if (profileId != null) {
            return missionRepository.countByEstadoAndProfileId(
                    CheckpointConstants.ESTADO_PENDIENTE, profileId);
        }
        return missionRepository.countByEstado(CheckpointConstants.ESTADO_PENDIENTE);
    }

    /**
     * Corrige con trim y valida los campos obligatorios de una misión nueva.
     * Modifica directamente el objeto recibido.
     *
     * @param m misión cuyos campos se van a normalizar y validar
     * @throws IllegalArgumentException excepción para cada campo inválido
     */
    private void normalizarYValidar(Mission m) {
        if (m == null) {
            throw new IllegalArgumentException("La misión no puede ser null.");
        }
        if (m.getTitulo() == null || m.getTitulo().isBlank()) {
            throw new IllegalArgumentException("El título es obligatorio.");
        }
        m.setTitulo(m.getTitulo().trim());
        if (m.getTitulo().length() < CheckpointConstants.MIN_TITULO) {
            throw new IllegalArgumentException("El título debe tener al menos " + CheckpointConstants.MIN_TITULO + " caracteres.");
        }
        if (m.getTitulo().length() > CheckpointConstants.MAX_TITULO) {
            throw new IllegalArgumentException("El título no puede exceder " + CheckpointConstants.MAX_TITULO + " caracteres.");
        }

        if (m.getDescripcion() == null || m.getDescripcion().isBlank()) {
            throw new IllegalArgumentException("La descripción es obligatoria.");
        }
        m.setDescripcion(m.getDescripcion().trim());
        if (m.getDescripcion().length() < CheckpointConstants.MIN_DESCRIPCION) {
            throw new IllegalArgumentException("La descripción debe tener al menos " + CheckpointConstants.MIN_DESCRIPCION + " caracteres.");
        }
        if (m.getDescripcion().length() > CheckpointConstants.MAX_DESCRIPCION) {
            throw new IllegalArgumentException("La descripción no puede exceder " + CheckpointConstants.MAX_DESCRIPCION + " caracteres.");
        }

        if (m.getXp() == null || m.getXp() < CheckpointConstants.MIN_XP || m.getXp() > CheckpointConstants.MAX_XP) {
            throw new IllegalArgumentException("XP debe ser un número entre " + CheckpointConstants.MIN_XP + " y " + CheckpointConstants.MAX_XP + ".");
        }
        if (m.getEstado() != null && !m.getEstado().isBlank()) {
            String estado = m.getEstado().trim().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estado)) {
                throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
            }
            m.setEstado(estado);
        }
    }

    /**
     * Valida solo los campos en el DTO de patch (los que no son {@code null}).
     *
     * @param dto campos enviados por el frontend en la petición PATCH
     * @throws IllegalArgumentException excepcion para cualquier campo inválido
     */
    private void validarCambios(PatchMisionDTO dto) {
        if (dto.getTitulo() != null) {
            if (dto.getTitulo().isBlank()) {
                throw new IllegalArgumentException("El título es obligatorio.");
            }
            if (dto.getTitulo().trim().length() < CheckpointConstants.MIN_TITULO) {
                throw new IllegalArgumentException("El título debe tener al menos " + CheckpointConstants.MIN_TITULO + " caracteres.");
            }
            if (dto.getTitulo().trim().length() > CheckpointConstants.MAX_TITULO) {
                throw new IllegalArgumentException("El título no puede exceder " + CheckpointConstants.MAX_TITULO + " caracteres.");
            }
        }
        if (dto.getDescripcion() != null) {
            if (dto.getDescripcion().isBlank()) {
                throw new IllegalArgumentException("La descripción es obligatoria.");
            }
            if (dto.getDescripcion().trim().length() < CheckpointConstants.MIN_DESCRIPCION) {
                throw new IllegalArgumentException("La descripción debe tener al menos " + CheckpointConstants.MIN_DESCRIPCION + " caracteres.");
            }
            if (dto.getDescripcion().trim().length() > CheckpointConstants.MAX_DESCRIPCION) {
                throw new IllegalArgumentException("La descripción no puede exceder " + CheckpointConstants.MAX_DESCRIPCION + " caracteres.");
            }
        }
        if (dto.getXp() != null) {
            if (dto.getXp() < CheckpointConstants.MIN_XP || dto.getXp() > CheckpointConstants.MAX_XP) {
                throw new IllegalArgumentException("XP debe ser un número entre " + CheckpointConstants.MIN_XP + " y " + CheckpointConstants.MAX_XP + ".");
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