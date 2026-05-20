package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa una misión, cada una pertenece a un perfil
 * y puede estar asociada a una categoría.
 * El estado puede pasa de {@code "pendiente"} a {@code "completada"} y en esta
 * suma su XP al total del perfil y puede desbloquear logros.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "missions")
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Título de la misión. Entre 3 y 120 caracteres.
     */
    @Column(nullable = false, length = 120)
    private String titulo;

    /**
     * Descripción de la misión. Entre 5 y 500 caracteres.
     */
    @Column(nullable = false, length = 500)
    private String descripcion;

    /**
     * Puntos de experiencia que se suman al completarse. Rango: 1–999.
     */
    @Column(nullable = false)
    private Integer xp;

    /**
     * Estado actual: {@code "pendiente"} o {@code "completada"}.
     */
    @Column(nullable = false, length = 20)
    private String estado;

    /**
     * Indica si el usuario ha marcado la misión como favorita.
     */
    @Column(nullable = false)
    private Boolean favorito = false;

    /**
     * Categoría a la que pertenece la misión. Puede ser {@code null}.
     */
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    /**
     * Perfil de la misión. Puede ser {@code null} para misiones globales.
     */
    @ManyToOne
    @JoinColumn(name = "profile_id")
    private Profile profile;
}