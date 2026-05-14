import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MissionService } from '../../services/mission';
import { AchievementService, AchievementApi } from '../../services/achievement';

interface AchievementVM {
  id: number;
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
  achievements: AchievementVM[] = [];
  totalXp = 0;
  completedCount = 0;
  favoritasCount = 0;
  desbloqueadosCount = 0;

  private catalogoApi: AchievementApi[] = [];
  private desbloqueadosIds = new Set<number>();
  private destroy$ = new Subject<void>();

  constructor(
    private missionService: MissionService,
    private achievementService: AchievementService,
  ) {}

  ngOnInit(): void {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));
    if (profileId) {
      this.missionService.cargarMisionesPorPerfil(profileId);
    } else {
      this.missionService.cargarMisiones();
    }
    this.cargarCatalogo();

    this.missionService.misiones$.pipe(takeUntil(this.destroy$)).subscribe((misiones) => {
      const completadas = misiones.filter((m) => m.estado === 'completada');
      this.totalXp = completadas.reduce((sum, m) => sum + m.xp, 0);
      this.completedCount = completadas.length;
      this.favoritasCount = misiones.filter((m) => m.favorito).length;
      this.calcularYDesbloquear();
    });
  }

  private cargarCatalogo() {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));

    this.achievementService.getCatalogo().subscribe((catalogo) => {
      this.catalogoApi = catalogo;

      if (profileId) {
        this.achievementService.getDesbloqueados(profileId).subscribe((desbloqueados) => {
          this.desbloqueadosIds = new Set(desbloqueados.map((d: any) => d.achievement.id));
          this.calcularYDesbloquear();
        });
      } else {
        this.calcularYDesbloquear();
      }
    });
  }

  private calcularYDesbloquear() {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));

    this.achievements = this.catalogoApi.map((logro) => {
      const unlocked = this.cumpleCondicion(logro);

      if (unlocked && profileId && !this.desbloqueadosIds.has(logro.id)) {
        this.desbloqueadosIds.add(logro.id);
        this.achievementService.unlock(profileId, logro.id).subscribe();
      }

      return {
        id: logro.id,
        title: logro.titulo,
        description: logro.descripcion,
        icon: logro.icono,
        unlocked,
      };
    });

    this.desbloqueadosCount = this.achievements.filter((a) => a.unlocked).length;
  }

  private cumpleCondicion(logro: AchievementApi): boolean {
    switch (logro.titulo) {
      case 'Primera Misión':
        return this.completedCount >= 1;
      case 'Explorador':
        return this.totalXp >= 100;
      case 'Racha de Fuego':
        return this.completedCount >= 5;
      case 'Coleccionista':
        return this.favoritasCount >= 3;
      case 'Veterano':
        return this.totalXp >= 500;
      case 'Leyenda':
        return this.completedCount >= 10;
      case 'Maestro':
        return this.totalXp >= 1000;
      case 'Imparable':
        return this.completedCount >= 20;
      default:
        return false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
