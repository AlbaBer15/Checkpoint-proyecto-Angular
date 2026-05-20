package com.checkpoint.backend.controller;

import com.checkpoint.backend.dto.PatchMisionDTO;
import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.service.MissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@Tag(name = "Misiones", description = "Gestión de misiones: crear, editar, completar, eliminar y estadísticas")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @Operation(summary = "Obtener todas las misiones")
    @ApiResponse(responseCode = "200", description = "Lista de misiones obtenida correctamente")
    @GetMapping
    public List<Mission> getAll() {
        return missionService.findAll();
    }

    @Operation(summary = "Obtener misiones de un perfil")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de misiones del perfil"),
            @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/profile/{profileId}")
    public List<Mission> getByProfile(@PathVariable Long profileId) {
        return missionService.findByProfile(profileId);
    }

    @Operation(summary = "Obtener una misión por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Misión encontrada"),
            @ApiResponse(responseCode = "404", description = "Misión no encontrada")
    })
    @GetMapping("/{id}")
    public Mission getById(@PathVariable Long id) {
        return missionService.findById(id);
    }

    @Operation(summary = "Crear una nueva misión")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Misión creada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mission create(@RequestBody Mission mission) {
        return missionService.create(mission);
    }

    @Operation(summary = "Actualizar parcialmente una misión", description = "Permite actualizar título, descripción, XP, estado, favorito y categoría de forma independiente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Misión actualizada correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Misión no encontrada")
    })
    @PatchMapping("/{id}")
    public Mission patch(@PathVariable Long id, @RequestBody PatchMisionDTO dto) {
        return missionService.patch(id, dto);
    }

    @Operation(summary = "Eliminar una misión")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Misión eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Misión no encontrada")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        missionService.delete(id);
    }

    @Operation(summary = "Obtener XP total acumulado de misiones completadas")
    @ApiResponse(responseCode = "200", description = "XP total calculado")
    @GetMapping("/stats/total-xp")
    public Long getTotalXP(@RequestParam(required = false) Long profileId) {
        return missionService.getTotalXP(profileId);
    }

    @Operation(summary = "Obtener número de misiones pendientes")
    @ApiResponse(responseCode = "200", description = "Conteo de misiones activas")
    @GetMapping("/stats/active-count")
    public Long getActiveMissionsCount(@RequestParam(required = false) Long profileId) {
        return missionService.getActiveMissionsCount(profileId);
    }
}
