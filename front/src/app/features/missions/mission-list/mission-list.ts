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
  orden: 'ninguno' | 'xp-desc' | 'xp-asc' | 'favoritas' | 'estado' = 'ninguno';
  categorias: Category[] = [];
  filtroCategoria?: number;

  get misionesFiltradas(): Mision[] {
    let lista = [...this.misiones];

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
      case 'favoritas':
        lista.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  eliminarMision(m: Mision) {
    if (!m.id) return;
    this.missionService
      .eliminarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error eliminando misión'),
      });
  }
  revertirMision(m: Mision) {
    if (!m.id) return;
    this.missionService
      .revertirMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error revirtiendo misión'),
      });
  }
  editarMision(evento: { id: number; datos: Partial<Mision> }) {
    this.missionService
      .editarMision(evento.id, evento.datos)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error editando misión'),
      });
  }

  marcarFavorito(m: Mision) {
    if (!m.id) return;
    this.missionService
      .toggleFavorito(m.id, m.favorito ?? false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error marcando favorito'),
      });
  }

  private mostrarErrorMensaje(err: any, accion: string) {
    this.mensajeError = err?.error?.mensaje || accion;
    this.mostrarError = true;
    console.error(accion + ':', err);
    setTimeout(() => (this.mostrarError = false), 5000);
  }
}
