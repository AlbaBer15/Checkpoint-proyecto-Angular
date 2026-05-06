package com.checkpoint.backend.controller;

import com.checkpoint.backend.entity.Achievement;
import com.checkpoint.backend.entity.ProfileAchievement;
import com.checkpoint.backend.service.AchievementService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:4200")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public List<Achievement> getAll() {
        return achievementService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Achievement create(@RequestBody Achievement achievement) {
        return achievementService.create(achievement);
    }

    @GetMapping("/profile/{profileId}")
    public List<ProfileAchievement> getByProfile(@PathVariable Long profileId) {
        return achievementService.findByProfile(profileId);
    }

    @PostMapping("/profile/{profileId}/unlock/{achievementId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileAchievement unlock(
            @PathVariable Long profileId,
            @PathVariable Long achievementId) {
        return achievementService.unlock(profileId, achievementId);
    }
}