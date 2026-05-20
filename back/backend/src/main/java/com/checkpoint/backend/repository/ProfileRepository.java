package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso a base de datos para perfiles. */
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    /** Comprueba si ya existe un perfil con ese nombre exacto. */
    boolean existsByNombre(String nombre);
}
