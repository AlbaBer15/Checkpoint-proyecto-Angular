package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Logros establecidos en la aplicación.
 * Los logros se desbloquean automáticamente cuando un perfil llega a
 * los puntos de XP marcados en {@code xpRequerido}.
 * Un valor de {@code 0} significa que el logro se desbloquea por otras indicaciones como
 * número de misiones, favoritos y casos
 * que el frontend evalúa por su cuenta.
 * Esta entidad usa Bean Validation ({@code @NotBlank}, {@code @Size}, {@code @Min})
 * en lugar de validación manual, como plus para exponer ambas opciones en el proyecto.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre del logro. Obligatorio, entre 3 y 80 caracteres.
     */
    @NotBlank(message = "El título del logro es obligatorio.")
    @Size(min = 3, max = 80, message = "El título debe tener entre 3 y 80 caracteres.")
    @Column(nullable = false, length = 80)
    private String titulo;

    /**
     * Descripción para obtener el logro. Máximo 200 caracteres.
     */
    @Size(max = 200, message = "La descripción no puede exceder 200 caracteres.")
    @Column(length = 200)
    private String descripcion;

    /**
     * XP mínimo total que debe tener el perfil para desbloquear el logro.
     */
    @Min(value = 0, message = "El XP requerido no puede ser negativo.")
    @Column
    private Integer xpRequerido = 0;

    /**
     * Icono del logro.
     */
    @Column(length = 10)
    private String icono;
}