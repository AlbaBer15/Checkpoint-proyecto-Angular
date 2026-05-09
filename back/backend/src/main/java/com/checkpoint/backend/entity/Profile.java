package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private Genero genero = Genero.FEMENINO;

    @Column(length = 40)
    private String avatar;

    @Column
    private Integer nivelMax = 1;

    @Column
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}