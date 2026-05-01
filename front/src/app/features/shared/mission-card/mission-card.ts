import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mision } from '../../../services/mission';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  templateUrl: './mission-card.html',
  styleUrl: './mission-card.css',
  imports: [CommonModule],
})
export class MissionCard {

  @Input({ required: true }) mision!: Mision;
  @Input() animado = false;
  @Output() completar = new EventEmitter<Mision>();
  @Output() eliminar = new EventEmitter<Mision>();
  @Output() marcarFavorito = new EventEmitter<Mision>();
  @Output() revertir = new EventEmitter<Mision>();

  marcarComoCompletada() {
    this.completar.emit(this.mision);
  }

  eliminarMision() {
    this.eliminar.emit(this.mision);
  }

  toggleFavorito() {
    this.marcarFavorito.emit(this.mision);
  }

  revertirMision() {
    this.revertir.emit(this.mision);
  }
}