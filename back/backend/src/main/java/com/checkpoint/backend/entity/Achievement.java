package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String titulo;

    @Column(length = 200)
    private String descripcion;

    @Column
    private Integer xpRequerido = 0;

    @Column(length = 10)
    private String icono;
}