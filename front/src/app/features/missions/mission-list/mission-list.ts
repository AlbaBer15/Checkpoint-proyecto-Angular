import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MissionCard } from '../../shared/mission-card/mission-card';
import { MissionService, Mision } from '../../../services/mission';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
  imports: [MissionCard, NgFor, NgIf],
})
export class MissionList implements OnInit, OnDestroy {

  misiones: Mision[] = [];
  
  mostrarError = false;
  mensajeError = '';
  cargando = true;
  private destroy$ = new Subject<void>();
  misionesAnimado = new Set<number>(); 

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.missionService.cargarMisiones();
    this.missionService.misiones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lista => {
        this.misiones = lista;
        this.cargando = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  completarMision(m: Mision) {
  if (!m.id) return;

  this.misionesAnimado.add(m.id);

  this.missionService.completarMision(m.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        setTimeout(() => {
          this.misionesAnimado.delete(m.id!);
          this.missionService.cargarMisiones();
        }, 1000);
      },
      error: (err) => {
        this.misionesAnimado.delete(m.id!);
        this.mostrarErrorMensaje(err, 'Error completando misión');
      }
    });
}

  eliminarMision(m: Mision) {
    if (!m.id) return;
    if (!confirm(`¿Eliminar la misión "${m.titulo}"?`)) return; 
    this.missionService.eliminarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error eliminando misión'),
      });
  }
  revertirMision(m: Mision) {
  if (!m.id) return;
  this.missionService.revertirMision(m.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      error: (err) => this.mostrarErrorMensaje(err, 'Error revirtiendo misión'),
    });
}

  marcarFavorito(m: Mision) {
    if (!m.id) return;
    this.missionService.toggleFavorito(m.id, m.favorito ?? false)
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