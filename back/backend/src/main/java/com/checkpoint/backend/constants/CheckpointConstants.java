package com.checkpoint.backend.constants;

/**
 * Constantes para nuestro proyecto.
 * Ideado para evitar números mágicos y textos hardcodeados.
 * Es un ejemplo que iría acorde al crecimiento del proyecto y las buenas prácticas.
 */
public final class CheckpointConstants {

    // Estados de misión
    public static final String ESTADO_PENDIENTE = "pendiente";
    public static final String ESTADO_COMPLETADA = "completada";
    // Restricciones de validaciones para misiones
    public static final int MIN_TITULO = 3;
    public static final int MAX_TITULO = 120;
    public static final int MIN_DESCRIPCION = 5;
    public static final int MAX_DESCRIPCION = 500;
    public static final int MIN_XP = 1;
    public static final int MAX_XP = 999;
    // Restricciones para perfil y categoría
    public static final int MAX_NOMBRE_PERFIL = 24;
    public static final int MAX_NOMBRE_CATEGORIA = 40;
    private CheckpointConstants() {
    }
}

