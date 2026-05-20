package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Categorías que clasifican las misiones.
 * Las 6 categorías predefinidas se crean al arrancar por
 * {@code DataInitializer} y no se pueden eliminar, solo cambiar o dejarlo a null.
 * El icono y el color se usan en el frontend para cada misión.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre de la categoría. Entre 3 y 40 caracteres. */
    @Column(nullable = false, length = 40)
    private String nombre;

    /** Icono de la categoría. */
    @Column(length = 10)
    private String icono;

    /** Color usado para el frontend en la categoría. */
    @Column(length = 20)
    private String color;
}