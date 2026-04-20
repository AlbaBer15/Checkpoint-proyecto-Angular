import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subscription, Subject } from 'rxjs';
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

  private sub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    // 1) pedir al backend
    this.missionService.cargarMisiones();

    // 2) escuchar cambios del BehaviorSubject (estado local)
    this.sub = this.missionService.misiones$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lista => {
        this.misiones = lista;
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  completarMision(m: Mision) {
    if (!m.id) return;
    this.missionService.completarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error completando misión'),
      });
  }

  eliminarMision(m: Mision) {
    if (!m.id) return;
    this.missionService.eliminarMision(m.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => this.mostrarErrorMensaje(err, 'Error eliminando misión'),
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