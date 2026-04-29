import { Component, OnInit, OnDestroy } from '@angular/core';
import { MissionService } from '../../services/mission';
import { LevelPipe } from '../shared/pipes/level-pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [LevelPipe],
  providers: [LevelPipe],
})

export class Home implements OnInit, OnDestroy {

  totalXP = 0;
  totalMisiones = 0;
  mensajeEstado = '';

  private destroy$ = new Subject<void>();

constructor(
  private missionService: MissionService,
  private levelPipe: LevelPipe
) {}

  ngOnInit() {
    this.cargarEstadisticas();

    this.missionService.misiones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarEstadisticas());
  }

  private cargarEstadisticas() {

    this.missionService.getTotalXP$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (xp) => {
          this.totalXP = xp;
          const { nivel } = this.levelPipe.transform(xp);
          this.actualizarMensaje(nivel);
        },
        error: (err) => console.error('Error cargando XP total:', err),
      });

    this.missionService.getActiveMissionsCount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.totalMisiones = count;
        },
        error: (err) => console.error('Error cargando misiones activas:', err),
      });
  }

  private readonly mensajes: Record<number, string> = {
  1: 'El viaje comienza... Cada paso te hace más fuerte.',
  2: 'Exploradora... Tu curiosidad es tu gran virtud.',
  3: 'Heroína... Estás dejando huella en el mundo. 🗡️',
  4: 'Guardiana del camino… Tu presencia inspira a otros.',
  5: 'Dominas cada desafío con valentía, aventurera.',
  6: 'Maestra del Camino… Tu sabiduría guía tu destino. 🔮',
  7: 'Heroína Estelar… Brillas incluso en la oscuridad. ⭐',
  8: 'Leyenda Errante… Tu nombre comienza a susurrarse. ⚔️',
  9: '💫 Campeona Arcana… Tu poder trasciende este mundo. 🔥',
};

private actualizarMensaje(nivel: number) {
  this.mensajeEstado = this.mensajes[nivel]
    ?? '✨ Tu historia ya es parte de las estrellas. 🌌';
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
