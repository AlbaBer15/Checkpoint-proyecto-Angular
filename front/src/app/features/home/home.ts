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
})
export class Home implements OnInit, OnDestroy {

  // Valores mostrados en el dashboard
  totalXP = 0;
  totalMisiones = 0;
  mensajeEstado = '';

  private destroy$ = new Subject<void>();

  constructor(private missionService: MissionService) {}

  ngOnInit() {
    this.cargarEstadisticas();

    // Si la lista de misiones cambia, recargar estadísticas
    this.missionService.misiones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarEstadisticas());
  }

  private cargarEstadisticas() {
    //  BACKEND CALCULA XP TOTAL
    this.missionService.getTotalXP$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (xp) => {
          this.totalXP = xp;
          this.actualizarMensaje();
        },
        error: (err) => console.error('Error cargando XP total:', err),
      });

    //  BACKEND CALCULA MISIONES PENDIENTES
    this.missionService.getActiveMissionsCount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => {
          this.totalMisiones = count;
        },
        error: (err) => console.error('Error cargando misiones activas:', err),
      });
  }

  private actualizarMensaje() {
    const pipe = new LevelPipe();
    const { nivel } = pipe.transform(this.totalXP);

    // Mensaje dinámico personalizado según nivel 
    switch (nivel) {
      case 1:
        this.mensajeEstado = 'El viaje comienza... Cada paso te hace más fuerte. ';
        break;

      case 2:
        this.mensajeEstado = 'Exploradora... Tu curiosidad es tu gran virtud.';
        break;

      case 3:
        this.mensajeEstado = 'Heroína... Estás dejando huella en el mundo. 🗡️';
        break;

      case 4:
        this.mensajeEstado = 'Guardiana del camino… Tu presencia inspira a otros.';
        break;

      case 5:
        this.mensajeEstado = 'Dominas cada desafío con valentía, aventurera.';
        break;

      case 6:
        this.mensajeEstado = 'Maestra del Camino… Tu sabiduría guía tu destino. 🔮';
        break;

      case 7:
        this.mensajeEstado = 'Heroína Estelar… Brillas incluso en la oscuridad. ⭐';
        break;

      case 8:
        this.mensajeEstado = 'Leyenda Errante… Tu nombre comienza a susurrarse en las tabernas. ⚔️';
        break;

      case 9:
        this.mensajeEstado = '💫 Campeona Arcana… Tu poder trasciende este mundo. 🔥';
        break;

      default: // Nivel 10+
        this.mensajeEstado = '✨Tu historia ya es parte de las estrellas. 🌌';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
