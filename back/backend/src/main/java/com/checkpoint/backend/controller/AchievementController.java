package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Achievement;
import com.checkpoint.backend.entity.ProfileAchievement;
import com.checkpoint.backend.service.AchievementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@Tag(name = "Logros", description = "Gestión de logros y desbloqueo por perfil")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @Operation(summary = "Obtener todos los logros del catálogo")
    @ApiResponse(responseCode = "200", description = "Catálogo de logros obtenido correctamente")
    @GetMapping
    public List<Achievement> getAll() {
        return achievementService.findAll();
    }

    @Operation(summary = "Obtener logros desbloqueados por un perfil")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logros desbloqueados del perfil"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/profile/{profileId}")
    public List<ProfileAchievement> getByProfile(@PathVariable Long profileId) {
        return achievementService.findByProfile(profileId);
    }

    @Operation(summary = "Crear un nuevo logro en el catálogo")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Logro creado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Achievement create(@Valid @RequestBody Achievement achievement) {
        return achievementService.create(achievement);
    }

    @Operation(summary = "Desbloquear un logro para un perfil", description = "Registra que un perfil ha conseguido un logro. No permite duplicados")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Logro desbloqueado correctamente"),
            @ApiResponse(responseCode = "400", description = "El logro ya estaba desbloqueado"),
            @ApiResponse(responseCode = "404", description = "Perfil o logro no encontrado")
    })
    @PostMapping("/profile/{profileId}/unlock/{achievementId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileAchievement unlock(
            @PathVariable Long profileId,
            @PathVariable Long achievementId) {
        return achievementService.unlock(profileId, achievementId);
    }
}
