package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MissionServiceTest {

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private MissionService missionService;

    @Test
    void create_lanzaExcepcion_si_titulo_vacio() {
        Mission mision = new Mission();
        mision.setTitulo("   ");
        mision.setDescripcion("Descripción válida");
        mision.setXp(10);

        assertThrows(IllegalArgumentException.class, () -> missionService.create(mision));
    }

    @Test
    void create_lanzaExcepcion_si_xp_fuera_de_rango() {
        Mission mision = new Mission();
        mision.setTitulo("Título válido");
        mision.setDescripcion("Descripción válida");
        mision.setXp(0);

        assertThrows(IllegalArgumentException.class, () -> missionService.create(mision));
    }

    @Test
    void delete_lanzaExcepcion_si_mision_no_existe() {
        when(missionRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> missionService.delete(99L));
    }
}
