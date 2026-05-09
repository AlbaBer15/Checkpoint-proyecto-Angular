import { Component, OnInit, OnDestroy } from '@angular/core';
import { MissionService } from '../../services/mission';
import { LevelPipe } from '../shared/pipes/level-pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface UserProfile {
  nombre: string;
  avatar: string;
  genero: 'FEMENINO' | 'MASCULINO';
}

const PERFIL_KEY = 'checkpoint_profile';

const PERFIL_DEFAULT: UserProfile = {
  nombre: 'Aventurera',
  avatar: '🧝‍♀️',
  genero: 'FEMENINO',
};

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [LevelPipe, FormsModule, NgIf, NgFor],
  providers: [LevelPipe],
})
export class Home implements OnInit, OnDestroy {
  totalXP = 0;
  totalMisiones = 0;
  mensajeEstado = '';

  perfil: UserProfile = { ...PERFIL_DEFAULT };
  editandoPerfil = false;
  perfilEdit: UserProfile = { ...PERFIL_DEFAULT };

  avatares = [
    '🧝‍♀️',
    '🧙‍♀️',
    '🦸‍♀️',
    '🦹‍♀️',
    '🧛‍♀️',
    '🧜‍♀️',
    '🧚‍♀️',
    '👸',
    '🧝‍♂️',
    '🧙‍♂️',
    '🦸‍♂️',
    '🦹‍♂️',
    '🧛‍♂️',
    '🧜‍♂️',
    '🧚‍♂️',
    '🤴',
    '⚔️',
    '🛡️',
    '🏹',
    '🔮',
    '💀',
    '👾',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private missionService: MissionService,
    private levelPipe: LevelPipe,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.cargarPerfil();
    this.cargarEstadisticas();
    this.missionService.misiones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cargarEstadisticas());
  }

  // ─── PERFIL ──────────────────────────────────────────────

  cargarPerfil() {
    const perfilGuardado = localStorage.getItem(PERFIL_KEY);
    if (perfilGuardado) {
      this.perfil = JSON.parse(perfilGuardado);
    }

    const perfilId = localStorage.getItem('checkpoint_profile_id');
    if (perfilId) {
      this.http.get<any>(`http://localhost:8080/api/profiles/${perfilId}`).subscribe({
        next: (res) => {
          this.perfil = {
            nombre: res.nombre,
            avatar: res.avatar ?? this.perfil.avatar,
            genero: res.genero ?? 'FEMENINO',
          };
          localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfil));
        },
        error: () => {
          localStorage.removeItem('checkpoint_profile_id');
        },
      });
    }
  }

  activarEdicionPerfil() {
    this.perfilEdit = { ...this.perfil };
    this.editandoPerfil = true;
  }

  cancelarEdicionPerfil() {
    this.editandoPerfil = false;
  }

  guardarPerfil() {
    if (!this.perfilEdit.nombre.trim()) return;
    this.perfil = { ...this.perfilEdit };
    localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfil));
    this.editandoPerfil = false;
    const { nivel } = this.levelPipe.transform(this.totalXP, this.perfil.genero);
    this.actualizarMensaje(nivel);

    const perfilId = localStorage.getItem('checkpoint_profile_id');
    if (perfilId) {
      this.http
        .put(`http://localhost:8080/api/profiles/${perfilId}`, {
          nombre: this.perfil.nombre,
          avatar: this.perfil.avatar,
          genero: this.perfil.genero,
        })
        .subscribe();
    } else {
      this.http
        .post<any>('http://localhost:8080/api/profiles', {
          nombre: this.perfil.nombre,
          avatar: this.perfil.avatar,
          genero: this.perfil.genero,
        })
        .subscribe((res) => {
          localStorage.setItem('checkpoint_profile_id', res.id);
        });
    }
  }

  get saludoPersonalizado(): string {
    const nombre = this.perfil.nombre || 'Aventurera';
    return this.perfil.genero === 'FEMENINO'
      ? `¡Bienvenida, ${nombre}!`
      : `¡Bienvenido, ${nombre}!`;
  }

  get tituloEstado(): string {
    return this.perfil.genero === 'FEMENINO' ? 'Estado de la aventurera' : 'Estado del aventurero';
  }

  // ─── STATS ───────────────────────────────────────────────

  private cargarEstadisticas() {
    this.missionService
      .getTotalXP$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (xp) => {
          this.totalXP = xp;
          const { nivel } = this.levelPipe.transform(xp, this.perfil.genero);
          this.actualizarMensaje(nivel);
        },
        error: (err) => console.error('Error cargando XP total:', err),
      });

    this.missionService
      .getActiveMissionsCount$()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (count) => (this.totalMisiones = count),
        error: (err) => console.error('Error cargando misiones activas:', err),
      });
  }

  private readonly mensajesFemenino: Record<number, string> = {
    1: 'El viaje comienza... Cada paso te hace más fuerte.',
    2: 'Exploradora... Tu curiosidad es tu gran virtud.',
    3: 'Heroína... Estás dejando huella en el mundo. 🗡️',
    4: 'Guardiana del camino… Tu presencia inspira a otros.',
    5: 'Dominas cada desafío con valentía, aventurera.',
    6: 'Maestra del Camino… Tu sabiduría guía tu destino. 🔮',
    7: 'Heroína Estelar… Brillas incluso en la oscuridad. ⭐',
    8: 'Leyenda Errante… Tu nombre se susurra en las tabernas. ⚔️',
    9: '💫 Campeona Arcana… Tu poder trasciende este mundo. 🔥',
  };

  private readonly mensajesMasculino: Record<number, string> = {
    1: 'El viaje comienza... Cada paso te hace más fuerte.',
    2: 'Explorador... Tu curiosidad es tu gran virtud.',
    3: 'Héroe... Estás dejando huella en el mundo. 🗡️',
    4: 'Guardián del camino… Tu presencia inspira a otros.',
    5: 'Dominas cada desafío con valentía, aventurero.',
    6: 'Maestro del Camino… Tu sabiduría guía tu destino. 🔮',
    7: 'Héroe Estelar… Brillas incluso en la oscuridad. ⭐',
    8: 'Leyenda Errante… Tu nombre se susurra en las tabernas. ⚔️',
    9: '💫 Campeón Arcano… Tu poder trasciende este mundo. 🔥',
  };

  private actualizarMensaje(nivel: number) {
    const mensajes =
      this.perfil.genero === 'FEMENINO' ? this.mensajesFemenino : this.mensajesMasculino;
    this.mensajeEstado = mensajes[nivel] ?? '✨ Tu historia ya es parte de las estrellas. 🌌';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
