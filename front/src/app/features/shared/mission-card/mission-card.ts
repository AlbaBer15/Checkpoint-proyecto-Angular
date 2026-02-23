import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mision } from '../../../services/mission';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  templateUrl: './mission-card.html',
  styleUrl: './mission-card.css',
  imports: [NgIf, CommonModule],
})
export class MissionCard {

  /**
   * Datos que recibe la tarjeta desde el componente padre (MissionList)
   * Representan la información de una misión individual.
   */
  @Input() titulo!: string;
  @Input() descripcion!: string;
  @Input() xp!: number;
  @Input() estado!: 'pendiente' | 'completada';

  /**
   * Propiedad visual para marcar misiones como favoritas.
   */
  @Input() favorito: boolean = false;

  /**
   * Eventos emitidos hacia MissionList
   * - completar: marca la misión como finalizada
   * - eliminar: elimina la misión del listado
   * - marcarFavorito: alterna el estado de favorito
   */
  @Output() completar = new EventEmitter<string>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() marcarFavorito = new EventEmitter<void>();

  /** Emitimos evento para completar la misión */
  marcarComoCompletada() {
    this.completar.emit(this.titulo);
  }

  /** Emitimos evento para eliminar la misión */
  eliminarMision() {
    this.eliminar.emit(this.titulo);
  }

  /** Emitimos evento para alternar el estado de favorito */
  toggleFavorito() {
    this.marcarFavorito.emit();
  }
}
