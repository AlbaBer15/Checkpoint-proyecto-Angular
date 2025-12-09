import { Component, OnInit } from '@angular/core';
import { MissionCard } from '../../shared/mission-card/mission-card';
import { NgFor } from '@angular/common';
import { MissionService, Mision } from '../../../services/mission';

@Component({
  selector: 'app-mission-list',
  standalone: true,
  templateUrl: './mission-list.html',
  styleUrl: './mission-list.css',
  imports: [MissionCard, NgFor],
})
export class MissionList implements OnInit {

  /** Lista de misiones recibida desde el servicio */
  misiones: Mision[] = [];

  constructor(private missionService: MissionService) {}

  /**
   * Nos suscribimos al stream de misiones.
   * Cada cambio (añadir, eliminar, completar, favorito) actualiza automáticamente la vista.
   */
  ngOnInit(): void {
    this.missionService.misiones$.subscribe((lista) => {
      this.misiones = lista;
    });
  }

  /** Marca una misión como completada */
  completarMision(titulo: string) {
    this.missionService.completarMision(titulo);
  }

  /** Elimina una misión completamente del listado */
  eliminarMision(titulo: string) {
    this.missionService.eliminarMision(titulo);
  }

  /** Alterna el estado de favorito de una misión */
  marcarFavorito(m: Mision) {
    this.missionService.toggleFavorito(m.titulo);
  }
}
