import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor } from '@angular/common';
import { Subscription } from 'rxjs';

import { MissionCard } from '../../shared/mission-card/mission-card';
import { MissionService, Mision } from '../../../services/mission';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
  imports: [MissionCard, NgFor],
})
export class MissionList implements OnInit, OnDestroy {

  misiones: Mision[] = [];
  private sub?: Subscription;

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    // 1) pedir al backend
    this.missionService.cargarMisiones();

    // 2) escuchar cambios del BehaviorSubject (estado local)
    this.sub = this.missionService.misiones$.subscribe(lista => {
      this.misiones = lista;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  completarMision(m: Mision) {
    if (!m.id) return; // por si acaso
    this.missionService.completarMision(m.id);
  }

  eliminarMision(m: Mision) {
    if (!m.id) return;
    this.missionService.eliminarMision(m.id);
  }

  marcarFavorito(m: Mision) {
    if (!m.id) return;
    this.missionService.toggleFavorito(m.id, m.favorito ?? false);
  }
}