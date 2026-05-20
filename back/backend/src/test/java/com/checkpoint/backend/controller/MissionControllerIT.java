package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.repository.MissionRepository;
import com.checkpoint.backend.repository.ProfileAchievementRepository;
import com.checkpoint.backend.repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MissionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProfileAchievementRepository profileAchievementRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Profile perfil;

    @BeforeEach
    void setUp() {
        profileAchievementRepository.deleteAll();
        missionRepository.deleteAll();
        profileRepository.deleteAll();

        perfil = new Profile();
        perfil.setNombre("PerfilTest");
        perfil = profileRepository.save(perfil);
    }

    @Test
    void create_devuelve201_y_mision_creada() throws Exception {
        Mission mision = new Mission();
        mision.setTitulo("Misión de integración");
        mision.setDescripcion("Descripción de prueba para el test");
        mision.setXp(25);
        mision.setEstado("pendiente");
        mision.setFavorito(false);
        mision.setProfile(perfil);

        mockMvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mision)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Misión de integración"))
                .andExpect(jsonPath("$.xp").value(25))
                .andExpect(jsonPath("$.estado").value("pendiente"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void create_devuelve400_si_xp_invalido() throws Exception {
        Mission mision = new Mission();
        mision.setTitulo("Misión inválida");
        mision.setDescripcion("Descripción de prueba");
        mision.setXp(0);
        mision.setProfile(perfil);

        mockMvc.perform(post("/api/missions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mision)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("XP debe ser un número entre 1 y 999."));
    }

    @Test
    void getByProfile_devuelve200_y_lista_misiones() throws Exception {
        mockMvc.perform(get("/api/missions/profile/" + perfil.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void delete_devuelve404_si_mision_no_existe() throws Exception {
        mockMvc.perform(delete("/api/missions/9999"))
                .andExpect(status().isNotFound());
    }
}
