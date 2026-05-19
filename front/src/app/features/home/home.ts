import { Component, OnInit, OnDestroy } from '@angular/core';
import { MissionService } from '../../services/mission';
import { ProfileService, Profile } from '../../services/profile.service';
import { LevelPipe } from '../shared/pipes/level-pipe';
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
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
  perfilesDisponibles: Profile[] = [];
  cargandoPerfiles = false;
  errorPerfil = '';
  perfilParaEliminar: Profile | null = null;

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
    private router: Router,
  ) {}

  // Carga el perfil guardado y suscribe las estadísticas
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

  // Carga el perfil activo o si no hay ID guardado, busca el primero disponible
  cargarPerfil() {
    const perfilId = localStorage.getItem('checkpoint_profile_id');
    if (perfilId) {
      this.profileService.getById(Number(perfilId)).subscribe({
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

  // Selecciona el primer perfil disponible cuando no hay ninguno en localStorage
  private cargarPrimerPerfilDisponible() {
    this.profileService.getAll().subscribe({
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
  // Abre el panel de edición y carga la lista de perfiles disponibles
  activarEdicionPerfil() {
    this.perfilEdit = { ...this.perfil };
    this.editandoPerfil = true;
    this.cargarPerfilesDisponibles();
  }

  // Obtiene todos los perfiles para mostrarlos en el selector
  private cargarPerfilesDisponibles() {
    this.cargandoPerfiles = true;
    this.profileService.getAll().subscribe({
      next: (perfiles) => {
        this.perfilesDisponibles = perfiles;
        this.cargandoPerfiles = false;
      },
      error: () => (this.cargandoPerfiles = false),
    });
  }

  // Establece el perfil seleccionado como activo y recarga sus misiones
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

  // Abre el formulario para crear un perfil nuevo
  iniciarCrearPerfil() {
    this.perfilEdit = { ...PERFIL_DEFAULT };
    this.editandoPerfil = true;
    this.perfilesDisponibles = [];
    localStorage.removeItem('checkpoint_profile_id');
  }

  // Limpia el formulario para empezar un perfil desde cero
  crearNuevoPerfil() {
    localStorage.removeItem('checkpoint_profile_id');
    this.perfilEdit = { ...PERFIL_DEFAULT };
    this.perfilesDisponibles = [];
  }

  // Guarda el perfil seleccionado para eliminarlo una vez confirmado
  pedirConfirmacionEliminarPerfil(perfil: Profile) {
    this.perfilParaEliminar = perfil;
  }

  // Cancela la eliminación y limpia el perfil pendiente
  cancelarEliminacionPerfil() {
    this.perfilParaEliminar = null;
  }

  // Elimina el perfil confirmado; si era el activo, selecciona otro o limpia el estado
  confirmarEliminacionPerfil() {
    const perfil = this.perfilParaEliminar;
    if (!perfil) return;
    this.perfilParaEliminar = null;

    this.profileService.delete(perfil.id).subscribe({
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
      error: () => this.mostrarErrorPerfil('Error al eliminar el perfil. Inténtalo de nuevo.'),
    });
  }

  // Cierra el panel de edición
  cancelarEdicionPerfil() {
    this.editandoPerfil = false;
    this.errorPerfil = '';
  }

  // Guarda los cambios del perfil o crea uno nuevo si no existe
  guardarPerfil() {
    if (!this.perfilEdit.nombre.trim()) {
      this.errorPerfil = 'El nombre no puede estar vacío.';
      return;
    }
    this.errorPerfil = '';
    this.perfil = { ...this.perfilEdit };
    localStorage.setItem(PERFIL_KEY, JSON.stringify(this.perfil));
    this.editandoPerfil = false;
    const { nivel } = this.levelPipe.transform(this.totalXP, this.perfil.genero);
    this.actualizarMensaje(nivel);

    const perfilId = localStorage.getItem('checkpoint_profile_id');
    if (perfilId) {
      this.profileService
        .update(Number(perfilId), {
          nombre: this.perfil.nombre,
          avatar: this.perfil.avatar,
          genero: this.perfil.genero,
        })
        .subscribe();
    } else {
      this.profileService
        .create({
          nombre: this.perfil.nombre,
          avatar: this.perfil.avatar,
          genero: this.perfil.genero,
        })
        .subscribe({
          next: (res) => {
            localStorage.setItem('checkpoint_profile_id', res.id.toString());
            this.sinPerfiles = false;
            this.missionService.cargarMisionesPorPerfil(res.id);
          },
          error: (err) => {
            this.mostrarErrorPerfil(err?.error?.mensaje || 'Error al crear el perfil.');
          },
        });
    }
  }

  // Devuelve el ID del perfil activo desde localStorage
  getPerfilId(): string {
    return localStorage.getItem('checkpoint_profile_id') ?? '0';
  }

  // Devuelve un saludo personalizado según el género del perfil activo
  get saludoPersonalizado(): string {
    const nombre = this.perfil.nombre || 'Aventurera';
    return this.perfil.genero === 'FEMENINO'
      ? `¡Bienvenida, ${nombre}!`
      : `¡Bienvenido, ${nombre}!`;
  }

  // Devuelve el título del panel según el género del perfil activo
  get tituloEstado(): string {
    return this.perfil.genero === 'FEMENINO' ? 'Estado de la aventurera' : 'Estado del aventurero';
  }

  // Consulta el XP total y el número de misiones activas y actualiza la vista
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

  // Actualiza el mensaje según el nivel alcanzado y el género del perfil
  private actualizarMensaje(nivel: number) {
    const mensajes =
      this.perfil.genero === 'FEMENINO' ? this.mensajesFemenino : this.mensajesMasculino;
    this.mensajeEstado = mensajes[nivel] ?? '✨ Tu historia ya es parte de las estrellas. 🌌';
  }

  // Muestra un mensaje de error y lo borra automáticamente tras 5 segundos
  private mostrarErrorPerfil(msg: string) {
    this.errorPerfil = msg;
    setTimeout(() => (this.errorPerfil = ''), 5000);
  }

  // Cancela todas las suscripciones activas al destruir el componente
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
