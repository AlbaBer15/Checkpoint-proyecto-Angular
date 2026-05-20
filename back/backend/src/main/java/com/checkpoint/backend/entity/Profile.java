package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Perfil de usuario que agrupa misiones y logros.
 * El nivel se calcula en el frontend a partir del XP acumulado.
 * El género personaliza los títulos de nivel en el frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del perfil. Entre 3 y 25 caracteres, tiene que ser único. */
    @Column(nullable = false, length = 60)
    private String nombre;

    /** Género del perfil, usado para adaptar los títulos de nivel. Por defecto {@code FEMENINO}. */
    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private Genero genero = Genero.FEMENINO;

    /** Icono seleccionado por el usuario. */
    @Column(length = 40)
    private String avatar;

    /** Fecha y hora en que se creó el perfil. */
    @Column
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}