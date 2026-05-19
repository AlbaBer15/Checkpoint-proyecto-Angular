import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MissionCard } from '../../shared/mission-card/mission-card';
import { MissionService, Mision } from '../../../services/mission';
import { CategoryService, Category } from '../../../services/category';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
  imports: [MissionCard, NgFor, NgIf],
})
export class MissionList implements OnInit, OnDestroy {
  misiones: Mision[] = [];
  filtro: 'todas' | 'pendientes' | 'completadas' | 'favoritas' = 'todas';
  orden: 'ninguno' | 'xp-desc' | 'xp-asc' | 'estado' = 'ninguno';
  categorias: Category[] = [];
  filtroCategoria?: number;

  // Filtra y ordena la lista según el estado, la categoría y el orden elegidos
  get misionesFiltradas(): Mision[] {
    let lista = [...this.misiones];
    lista.sort((a, b) => {
      if (a.estado === b.estado) return (b.id ?? 0) - (a.id ?? 0);
      return a.estado === 'pendiente' ? -1 : 1;
    });

    switch (this.filtro) {
      case 'pendientes':
        lista = lista.filter((m) => m.estado === 'pendiente');
        break;
      case 'completadas':
        lista = lista.filter((m) => m.estado === 'completada');
        break;
      case 'favoritas':
        lista = lista.filter((m) => m.favorito);
        break;
    }

    switch (this.orden) {
      case 'xp-desc':
        lista.sort((a, b) => b.xp - a.xp);
        break;
      case 'xp-asc':
        lista.sort((a, b) => a.xp - b.xp);
        break;
      case 'estado':
        lista.sort((a, b) => a.estado.localeCompare(b.estado));
        break;
    }

    if (this.filtroCategoria !== undefined) {
      lista = lista.filter((m) => m.category?.id === this.filtroCategoria);
    }

    return lista;
  }
  mostrarError = false;
  mensajeError = '';
  cargando = true;
  private destroy$ = new Subject<void>();
  misionesAnimado = new Set<number>();

  constructor(
    private missionService: MissionService,
    private categoryService: CategoryService,
  ) {}

  // Carga las misiones del perfil activo y las categorías para el filtro
  ngOnInit(): void {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));

    if (profileId) {
      this.missionService.cargarMisionesPorPerfil(profileId);
    } else {
      this.missionService.cargarMisiones();
    }

    this.missionService.misiones$.pipe(takeUntil(this.destroy$)).subscribe((lista) => {
      this.misiones = lista;
      this.cargando = false;
    });

    this.categoryService.getAll().subscribe((cats) => {
      this.categorias = cats;
    });
  }

  // Cancela todas las suscripciones activas al destruir el componente
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Marca la misión como completada y recarga la lista tras una animación
  completarMision(m: Mision) {
    if (!m.id) return;

    this.misionesAnimado.add(m.id);

    this.missionService
      .completarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.misionesAnimado.delete(m.id!);
            this.missionService.recargarMisiones();
          }, 1000);
        },
        error: (err) => {
          this.misionesAnimado.delete(m.id!);
          this.mostrarErrorMensaje(err, 'Error completando misión');
        },
      });
  }

  // Elimina la misión y actualiza la lista
  eliminarMision(m: Mision) {
    if (!m.id) return;
    this.missionService
      .eliminarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error eliminando misión'),
      });
  }

  // Revierte la misión completada a estado pendiente
  revertirMision(m: Mision) {
    if (!m.id) return;
    this.missionService
      .revertirMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error revirtiendo misión'),
      });
  }

  // Guarda los cambios de una misión editada
  editarMision(evento: { id: number; datos: Partial<Mision> }) {
    this.missionService
      .editarMision(evento.id, evento.datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error editando misión'),
      });
  }

  // Cambia el estado "favorito" de la misión al valor contrario y actualiza la lista
  marcarFavorito(m: Mision) {
    if (!m.id) return;
    this.missionService
      .toggleFavorito(m.id, m.favorito ?? false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error marcando favorito'),
      });
  }

  // Muestra un mensaje de error y lo borra automáticamente
  private mostrarErrorMensaje(err: any, accion: string) {
    this.mensajeError = err?.error?.mensaje || accion;
    this.mostrarError = true;
    console.error(accion + ':', err);
    setTimeout(() => (this.mostrarError = false), 5000);
  }
}
