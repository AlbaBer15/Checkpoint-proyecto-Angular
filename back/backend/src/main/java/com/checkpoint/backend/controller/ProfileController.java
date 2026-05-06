package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Profile;
import com.checkpoint.backend.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public List<Profile> getAll() {
        return profileService.findAll();
    }

    @GetMapping("/{id}")
    public Profile getById(@PathVariable Long id) {
        return profileService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Profile create(@RequestBody Profile profile) {
        return profileService.create(profile);
    }

    @PutMapping("/{id}")
    public Profile update(@PathVariable Long id, @RequestBody Profile datos) {
        return profileService.update(id, datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        profileService.delete(id);
    }
}