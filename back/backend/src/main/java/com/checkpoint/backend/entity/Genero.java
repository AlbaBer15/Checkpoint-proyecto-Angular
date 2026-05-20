package com.checkpoint.backend.entity;

/**
 * Género del perfil de usuario.
 * Se guarda como {@code STRING} en base de datos y se usa en el frontend
 * para seleccionar los titulos correctos en {@code LevelPipe}.
 */
public enum Genero {
    FEMENINO,
    MASCULINO
}
