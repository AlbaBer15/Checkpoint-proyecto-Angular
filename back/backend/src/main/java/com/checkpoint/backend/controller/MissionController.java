package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Mission;
import com.checkpoint.backend.service.MissionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
@CrossOrigin(origins = "http://localhost:4200")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @GetMapping
    public List<Mission> getAll() {
        return missionService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mission create(@RequestBody Mission mission) {
        return missionService.create(mission);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        missionService.delete(id);
    }

    /**
     * PATCH flexible: permite actualizar parcialmente campos como estado y favorito.
     * Ejemplos body:
     * { "estado": "completada" }
     * { "favorito": true }
     * { "estado": "pendiente", "favorito": false }
     */
    @PatchMapping("/{id}")
    public Mission patch(@PathVariable Long id, @RequestBody Map<String, Object> changes) {
        return missionService.patch(id, changes);
    }
}