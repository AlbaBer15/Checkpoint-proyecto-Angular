package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@Tag(name = "Perfiles", description = "Gestión de perfiles de usuario")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @Operation(summary = "Obtener todos los perfiles")
    @ApiResponse(responseCode = "200", description = "Lista de perfiles obtenida correctamente")
    @GetMapping
    public List<Profile> getAll() {
        return profileService.findAll();
    }

    @Operation(summary = "Obtener un perfil por ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil encontrado"),
        @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @GetMapping("/{id}")
    public Profile getById(@PathVariable Long id) {
        return profileService.findById(id);
    }

    @Operation(summary = "Crear un nuevo perfil", description = "Al crear el perfil se generan automáticamente 3 misiones de bienvenida")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Perfil creado correctamente"),
        @ApiResponse(responseCode = "400", description = "Nombre inválido o ya existente")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Profile create(@RequestBody Profile profile) {
        return profileService.create(profile);
    }

    @Operation(summary = "Actualizar un perfil", description = "Permite actualizar nombre, avatar y género")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @PutMapping("/{id}")
    public Profile update(@PathVariable Long id, @RequestBody Profile datos) {
        return profileService.update(id, datos);
    }

    @Operation(summary = "Eliminar un perfil", description = "Elimina el perfil junto con todas sus misiones y logros asociados")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Perfil eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Perfil no encontrado")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        profileService.delete(id);
    }
}
