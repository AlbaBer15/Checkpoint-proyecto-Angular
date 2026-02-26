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

        if (m.getDescripcion() != null) {
            m.setDescripcion(m.getDescripcion().trim());
        }

        if (m.getXp() == null || m.getXp() < 0) {
            throw new IllegalArgumentException("XP debe ser un número >= 0.");
        }

        if (m.getEstado() != null && !m.getEstado().isBlank()) {
            String estado = m.getEstado().trim().toLowerCase();
            if (!ESTADOS_VALIDOS.contains(estado)) {
                throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
            }
            m.setEstado(estado);
        }
    }public void delete(Long id) {
        if (!missionRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe la misión con id " + id);
        }
        missionRepository.deleteById(id);
    }

    public Mission patch(Long id, Map<String, Object> changes) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe la misión con id " + id));

        if (changes.containsKey("estado")) {
            Object v = changes.get("estado");
            if (v != null) {
                String estado = v.toString().trim().toLowerCase();
                if (!ESTADOS_VALIDOS.contains(estado)) {
                    throw new IllegalArgumentException("Estado inválido. Usa 'pendiente' o 'completada'.");
                }
                mission.setEstado(estado);
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

        return missionRepository.save(mission);
    }

}