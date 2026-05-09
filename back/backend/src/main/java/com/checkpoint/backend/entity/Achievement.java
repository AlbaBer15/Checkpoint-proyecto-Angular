package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título del logro es obligatorio.")
    @Size(min = 3, max = 80, message = "El título debe tener entre 3 y 80 caracteres.")
    @Column(nullable = false, length = 80)
    private String titulo;

    @Size(max = 200, message = "La descripción no puede exceder 200 caracteres.")
    @Column(length = 200)
    private String descripcion;

    @Min(value = 0, message = "El XP requerido no puede ser negativo.")
    @Column
    private Integer xpRequerido = 0;

    @Column(length = 10)
    private String icono;
}