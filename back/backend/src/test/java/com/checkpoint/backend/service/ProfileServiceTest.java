package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileAchievementRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private MissionRepository missionRepository;

    @Mock
    private ProfileAchievementRepository profileAchievementRepository;

    @InjectMocks
    private ProfileService profileService;

    private Profile perfil;

    @BeforeEach
    void setUp() {
        perfil = new Profile();
        perfil.setNombre("Alba");
    }

    @Test
    void create_lanzaExcepcion_si_nombre_vacio() {
        perfil.setNombre("   ");

        assertThrows(IllegalArgumentException.class, () -> profileService.create(perfil));
    }

    @Test
    void create_lanzaExcepcion_si_nombre_duplicado() {
        when(profileRepository.existsByNombre("Alba")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> profileService.create(perfil));
    }

    @Test
    void create_guarda_perfil_correctamente() {
        Profile guardado = new Profile();
        guardado.setId(1L);
        guardado.setNombre("Alba");

        when(profileRepository.existsByNombre("Alba")).thenReturn(false);
        when(profileRepository.save(any())).thenReturn(guardado);
        when(missionRepository.saveAll(any())).thenReturn(List.of());

        Profile resultado = profileService.create(perfil);

        assertEquals("Alba", resultado.getNombre());
        verify(profileRepository).save(any());
        verify(missionRepository).saveAll(any());
    }

    @Test
    void delete_lanzaExcepcion_si_perfil_no_existe() {
        when(profileRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> profileService.delete(99L));
    }
}
