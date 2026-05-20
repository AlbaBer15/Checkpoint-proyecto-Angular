package com.checkpoint.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Tabla intermedia que registra que logros ha desbloqueado cada perfil.
 * La combinación {@code (profile, achievement)} es única;
 *  se garantiza en la capa de servicio mediante
 * {@code ProfileAchievementRepository.existsByProfileIdAndAchievementId}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "profile_achievements")
public class ProfileAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Perfil que ha conseguido el logro. */
    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    /** Logro desbloqueado. */
    @ManyToOne
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;

    /** Fecha y hora en que se desbloqueo el logro. */
    @Column
    private LocalDateTime desbloqueadoEn = LocalDateTime.now();
}