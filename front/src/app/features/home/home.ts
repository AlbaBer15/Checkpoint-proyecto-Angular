import { Component, OnInit, OnDestroy } from '@angular/core';
import { MissionService } from '../../services/mission';
import { ProfileService } from '../../services/profile.service';
import { LevelPipe } from '../shared/pipes/level-pipe';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  sinPerfiles = false;
  perfilEdit: UserProfile = { ...PERFIL_DEFAULT };
  perfilesDisponibles: any[] = [];
  cargandoPerfiles = false;

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
    '🏹',
    '🔮',
    '💀',
    '👾',
  ];

  private destroy$ = new Subject<void>();
  mensajeGuard = false;

  constructor(
    private missionService: MissionService,
    private profileService: ProfileService,
    private levelPipe: LevelPipe,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.mensajeGuard = nav?.extras?.state?.['mensajeGuard'] ?? false;

    const perfilGuardado = localStorage.getItem(PERFIL_KEY);
    if (perfilGuardado) {
      try {
        this.perfil = JSON.parse(perfilGuardado);
      } catch {}
    }

    this.missionService.misiones$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(() => this.cargarEstadisticas());

    this.cargarPerfil();
  }

  cargarPerfil() {
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
          this.sinPerfiles = false;
          this.missionService.cargarMisionesPorPerfil(Number(perfilId));
          this.profileService.markReady();
        },
        error: () => {
          localStorage.removeItem('checkpoint_profile_id');
          this.cargarPrimerPerfilDisponible();
        },
      });
    } else {
      this.cargarPrimerPerfilDisponible();
    }
  }

  private cargarPrimerPerfilDisponible() {
    this.http.get<any[]>('http://localhost:8080/api/profiles').subscribe({
      next: (perfiles) => {
        if (perfiles.length > 0) {
          const primero = perfiles[0];
          this.perfil = {
            nombre: primero.nombre,
            avatar: primero.avatar ?? '🧝‍♀️',
            genero: primero.genero ?? 'FEMENINO',
          };
          localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfil));
          localStorage.setItem('checkpoint_profile_id', primero.id.toString());
          this.sinPerfiles = false;
          this.missionService.cargarMisionesPorPerfil(primero.id);
        } else {
          this.sinPerfiles = true;
          this.missionService.cargarMisiones();
        }
        this.profileService.markReady();
      },
      error: () => {
        this.sinPerfiles = true;
        this.profileService.markReady();
      },
    });
  }
  activarEdicionPerfil() {
    this.perfilEdit = { ...this.perfil };
    this.editandoPerfil = true;
    this.cargarPerfilesDisponibles();
  }

  private cargarPerfilesDisponibles() {
    this.cargandoPerfiles = true;
    this.http.get<any[]>('http://localhost:8080/api/profiles').subscribe({
      next: (perfiles) => {
        this.perfilesDisponibles = perfiles;
        this.cargandoPerfiles = false;
      },
      error: () => (this.cargandoPerfiles = false),
    });
  }

  seleccionarPerfil(perfil: any) {
    this.perfil = {
      nombre: perfil.nombre,
      avatar: perfil.avatar ?? '🧝‍♀️',
      genero: perfil.genero ?? 'FEMENINO',
    };
    localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfil));
    localStorage.setItem('checkpoint_profile_id', perfil.id.toString());
    this.editandoPerfil = false;
    this.missionService.cargarMisionesPorPerfil(perfil.id);
    const { nivel } = this.levelPipe.transform(this.totalXP, this.perfil.genero);
    this.actualizarMensaje(nivel);
  }

  iniciarCrearPerfil() {
    this.perfilEdit = { ...PERFIL_DEFAULT };
    this.editandoPerfil = true;
    this.perfilesDisponibles = [];
    localStorage.removeItem('checkpoint_profile_id');
  }

  crearNuevoPerfil() {
    localStorage.removeItem('checkpoint_profile_id');
    this.perfilEdit = { ...PERFIL_DEFAULT };
    this.perfilesDisponibles = [];
  }

  eliminarPerfil(perfil: any) {
    if (!confirm(`¿Eliminar el perfil "${perfil.nombre}"? Esta acción no se puede deshacer.`))
      return;

    this.http.delete(`http://localhost:8080/api/profiles/${perfil.id}`).subscribe({
      next: () => {
        const eraActivo = localStorage.getItem('checkpoint_profile_id') === perfil.id.toString();
        this.perfilesDisponibles = this.perfilesDisponibles.filter((p) => p.id !== perfil.id);

        if (eraActivo) {
          localStorage.removeItem('checkpoint_profile_id');
          localStorage.removeItem(PERFIL_KEY);
          this.perfil = { ...PERFIL_DEFAULT };

          if (this.perfilesDisponibles.length > 0) {
            this.seleccionarPerfil(this.perfilesDisponibles[0]);
          } else {
            this.sinPerfiles = true;
            this.editandoPerfil = false;
            this.missionService.cargarMisiones();
            this.totalXP = 0;
            this.totalMisiones = 0;
            this.mensajeEstado = '';
          }
        }
      },
      error: () => alert('Error al eliminar el perfil. Inténtalo de nuevo.'),
    });
  }

  cancelarEdicionPerfil() {
    if (
      this.perfilEdit.nombre !== this.perfil.nombre ||
      this.perfilEdit.avatar !== this.perfil.avatar ||
      this.perfilEdit.genero !== this.perfil.genero
    ) {
      if (!confirm('¿Descartar los cambios?')) return;
    }
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
        .subscribe({
          next: (res) => {
            localStorage.setItem('checkpoint_profile_id', res.id.toString());
            this.sinPerfiles = false;
            this.missionService.cargarMisionesPorPerfil(Number(res.id));
          },
          error: (err) => {
            const msg = err?.error?.mensaje || 'Error al crear el perfil';
            alert(msg);
          },
        });
    }
  }

  getPerfilId(): string {
    return localStorage.getItem('checkpoint_profile_id') ?? '0';
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

  private cargarEstadisticas() {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id')) || undefined;

    this.missionService
      .getTotalXP$(profileId)
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
      .getActiveMissionsCount$(profileId)
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
