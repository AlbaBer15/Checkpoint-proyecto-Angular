package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.repository.MissionRepository;
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
class ProfileControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void limpiarBD() {
        missionRepository.deleteAll();
        profileRepository.deleteAll();
    }

    @Test
    void getAll_devuelve200_y_lista_vacia() throws Exception {
        mockMvc.perform(get("/api/profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void create_devuelve201_y_perfil_creado() throws Exception {
        Profile perfil = new Profile();
        perfil.setNombre("Alba");

        mockMvc.perform(post("/api/profiles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(perfil)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Alba"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void create_devuelve400_si_nombre_duplicado() throws Exception {
        Profile perfil = new Profile();
        perfil.setNombre("Alba");

        mockMvc.perform(post("/api/profiles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(perfil)));

        mockMvc.perform(post("/api/profiles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(perfil)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_devuelve404_si_perfil_no_existe() throws Exception {
        mockMvc.perform(delete("/api/profiles/9999"))
                .andExpect(status().isNotFound());
    }
}
