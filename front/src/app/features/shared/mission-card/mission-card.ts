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

  // ✅ ahora la tarjeta recibe la misión entera (incluye id)
  @Input({ required: true }) mision!: Mision;

  // ✅ eventos: emitimos el objeto (o id) al padre
  @Output() completar = new EventEmitter<Mision>();
  @Output() eliminar = new EventEmitter<Mision>();
  @Output() marcarFavorito = new EventEmitter<Mision>();

  marcarComoCompletada() {
    this.completar.emit(this.mision);
  }

  eliminarMision() {
    this.eliminar.emit(this.mision);
  }

  toggleFavorito() {
    this.marcarFavorito.emit(this.mision);
  }
}