import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MissionService } from '../../services/mission';
import { AchievementService, AchievementApi } from '../../services/achievement';
import { LevelPipe } from '../shared/pipes/level-pipe';

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
  providers: [LevelPipe],
})
export class Achievements implements OnInit, OnDestroy {
  achievements: AchievementVM[] = [];
  totalXp = 0;
  completedCount = 0;
  favoritasCount = 0;
  desbloqueadosCount = 0;

  genero: 'FEMENINO' | 'MASCULINO' = 'FEMENINO';
  nivelActual = 1;
  tituloNivel = '';
  progresoNivel = 0;
  xpEnNivel = 0;
  xpParaSiguiente = 0;
  nivelesTrack: Array<{ nivel: number; completado: boolean; actual: boolean }> = [];

  readonly CIRCUMFERENCE = 2 * Math.PI * 54;

  get strokeOffset(): number {
    return this.CIRCUMFERENCE * (1 - this.nivelActual / 10);
  }

  private readonly nivelesData = [
    { nivel: 1, min: 0, max: 49 },
    { nivel: 2, min: 50, max: 119 },
    { nivel: 3, min: 120, max: 199 },
    { nivel: 4, min: 200, max: 299 },
    { nivel: 5, min: 300, max: 449 },
    { nivel: 6, min: 450, max: 649 },
    { nivel: 7, min: 650, max: 899 },
    { nivel: 8, min: 900, max: 1199 },
    { nivel: 9, min: 1200, max: 1599 },
    { nivel: 10, min: 1600, max: Infinity },
  ];

  private catalogoApi: AchievementApi[] = [];
  private desbloqueadosIds = new Set<number>();
  private destroy$ = new Subject<void>();

  constructor(
    private missionService: MissionService,
    private achievementService: AchievementService,
    private levelPipe: LevelPipe,
  ) {}

  ngOnInit(): void {
    const perfilData = localStorage.getItem('checkpoint_profile');
    if (perfilData) {
      try {
        this.genero = JSON.parse(perfilData).genero ?? 'FEMENINO';
      } catch {}
    }

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
      this.actualizarNivel();
      this.calcularYDesbloquear();
    });
  }

  private actualizarNivel(): void {
    const info = this.levelPipe.transform(this.totalXp, this.genero);
    this.nivelActual = info.nivel;
    this.tituloNivel = info.titulo;
    this.progresoNivel = info.progreso;
    const rango = this.nivelesData.find((n) => n.nivel === this.nivelActual)!;
    this.xpEnNivel = this.totalXp - rango.min;
    this.xpParaSiguiente = rango.max === Infinity ? 0 : rango.max - rango.min + 1;
    this.nivelesTrack = this.nivelesData.map((n) => ({
      nivel: n.nivel,
      completado: this.totalXp >= n.min,
      actual: this.nivelActual === n.nivel,
    }));
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
