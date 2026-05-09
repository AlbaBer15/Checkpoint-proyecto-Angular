import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MissionService } from '../../services/mission';
// Te cambio Subscription por Subject porque lo quite del resto para dejar solo el takeUntil en el componente de misiones y asi usamos lo mismo en todo el proyecto
interface Achievement {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievements.html',
  styleUrls: ['./achievements.css'],
})
export class Achievements implements OnInit, OnDestroy {
  achievements: Achievement[] = [];
  totalXp = 0;
  completedCount = 0;
  desbloqueadosCount = 0;
  favoritasCount = 0;

  private destroy$ = new Subject<void>();

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.missionService.cargarMisiones();

    this.missionService.misiones$.pipe(takeUntil(this.destroy$)).subscribe((misiones) => {
      const completadas = misiones.filter((m) => m.estado === 'completada');
      this.totalXp = completadas.reduce((sum, m) => sum + m.xp, 0);
      this.completedCount = completadas.length;
      this.favoritasCount = misiones.filter((m) => m.favorito).length;
      this.achievements = this.calcularLogros();
      this.desbloqueadosCount = this.achievements.filter((l) => l.unlocked).length;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calcularLogros(): Achievement[] {
    return [
      {
        title: 'Primera Misión',
        description: 'Completa tu primera misión',
        icon: '⚔️',
        unlocked: this.completedCount >= 1,
      },
      {
        title: 'Explorador',
        description: 'Acumula 100 XP',
        icon: '🌍',
        unlocked: this.totalXp >= 100,
      },
      {
        title: 'Racha de Fuego',
        description: 'Completa 5 misiones',
        icon: '🔥',
        unlocked: this.completedCount >= 5,
      },
      {
        title: 'Coleccionista',
        description: 'Ten 3 misiones favoritas',
        icon: '❤️',
        unlocked: this.favoritasCount >= 3,
      },
      {
        title: 'Veterano',
        description: 'Acumula 500 XP',
        icon: '⚔️',
        unlocked: this.totalXp >= 500,
      },
      {
        title: 'Leyenda',
        description: 'Completa 10 misiones',
        icon: '👑',
        unlocked: this.completedCount >= 10,
      },
      {
        title: 'Maestro',
        description: 'Acumula 1000 XP',
        icon: '🌟',
        unlocked: this.totalXp >= 1000,
      },
      {
        title: 'Imparable',
        description: 'Completa 20 misiones',
        icon: '💫',
        unlocked: this.completedCount >= 20,
      },
    ];
  }
}
