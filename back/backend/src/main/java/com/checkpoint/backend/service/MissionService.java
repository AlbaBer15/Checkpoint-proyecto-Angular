package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.repository.MissionRepository;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;
import java.util.Set;

@Service
public class MissionService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of("pendiente", "completada");

    private final MissionRepository missionRepository;

    public MissionService(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    public List<Mission> findAll() {
        return missionRepository.findAll();
    }

    public Mission create(Mission mission) {
        normalizarYValidar(mission);

        // Defaults si vienen null
        if (mission.getFavorito() == null) {
            mission.setFavorito(false);
        }
        if (mission.getEstado() == null || mission.getEstado().isBlank()) {
            mission.setEstado("pendiente");
        }

        return missionRepository.save(mission);
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
        if (m.getDescripcion() != null && m.getDescripcion().length() > 500) {
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
            Integer xp;
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

    public void delete(Long id) {
        if (!missionRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe la misión con id " + id);
        }
        missionRepository.deleteById(id);
    }

    public Mission patch(Long id, Map<String, Object> changes) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe la misión con id " + id));

        validarCambios(changes);

        if (changes.containsKey("titulo")) {
            mission.setTitulo(changes.get("titulo").toString().trim());
        }

        if (changes.containsKey("descripcion")) {
            mission.setDescripcion(changes.get("descripcion").toString().trim());
        }

        if (changes.containsKey("xp")) {
            Integer xp = Integer.parseInt(changes.get("xp").toString());
            mission.setXp(xp);
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
                // por si llega como "true"/"false"
                mission.setFavorito(Boolean.parseBoolean(v.toString()));
            }
        }

        normalizarYValidar(mission);

        return missionRepository.save(mission);
    }



    public Long getTotalXP() {
        return missionRepository.findAll()
                .stream()
                .filter(m -> "completada".equals(m.getEstado()))
                .mapToLong(Mission::getXp)
                .sum();
    }


    public Long getActiveMissionsCount() {
        return missionRepository.findAll()
                .stream()
                .filter(m -> "pendiente".equals(m.getEstado()))
                .count();
    }

}