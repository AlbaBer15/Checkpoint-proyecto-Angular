package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Achievement;
import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.entity.ProfileAchievement;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.AchievementRepository;
import com.checkpoint.backend.repository.ProfileAchievementRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AchievementServiceTest {

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private ProfileAchievementRepository profileAchievementRepository;

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private AchievementService achievementService;

    @Test
    void unlock_lanzaExcepcion_si_logro_ya_desbloqueado() {
        when(profileAchievementRepository.existsByProfileIdAndAchievementId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> achievementService.unlock(1L, 1L));
    }

    @Test
    void unlock_lanzaExcepcion_si_perfil_no_existe() {
        when(profileAchievementRepository.existsByProfileIdAndAchievementId(99L, 1L)).thenReturn(false);
        when(profileRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> achievementService.unlock(99L, 1L));
    }

    @Test
    void findByProfile_devuelve_lista_vacia_si_no_tiene_logros() {
        when(profileAchievementRepository.findByProfileId(1L)).thenReturn(List.of());

        List<ProfileAchievement> resultado = achievementService.findByProfile(1L);

        assertTrue(resultado.isEmpty());
    }
}
