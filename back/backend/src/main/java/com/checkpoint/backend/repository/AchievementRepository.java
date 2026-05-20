package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a base de datos para logros. */
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

}