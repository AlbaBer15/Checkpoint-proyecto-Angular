import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mision } from '../../../services/mission';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  templateUrl: './mission-card.html',
  styleUrl: './mission-card.css',
  imports: [CommonModule, FormsModule],
})
export class MissionCard {

  @Input({ required: true }) mision!: Mision;
  @Input() animado = false;

  @Output() completar = new EventEmitter<Mision>();
  @Output() eliminar = new EventEmitter<Mision>();
  @Output() marcarFavorito = new EventEmitter<Mision>();
  @Output() revertir = new EventEmitter<Mision>();
  @Output() editar = new EventEmitter<{ id: number; datos: Partial<Mision> }>();

  editando = false;
  tituloEdit = '';
  descripcionEdit = '';
  xpEdit = 0;

  activarEdicion() {
    this.tituloEdit = this.mision.titulo;
    this.descripcionEdit = this.mision.descripcion;
    this.xpEdit = this.mision.xp;
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarEdicion() {
    if (!this.mision.id) return;
    if (!this.tituloEdit.trim() || this.tituloEdit.trim().length < 3) return;
    if (!this.descripcionEdit.trim() || this.descripcionEdit.trim().length < 5) return;
    if (this.xpEdit < 1 || this.xpEdit > 999) return;

    this.editar.emit({
      id: this.mision.id,
      datos: {
        titulo: this.tituloEdit.trim(),
        descripcion: this.descripcionEdit.trim(),
        xp: this.xpEdit,
      }
    });
    this.editando = false;
  }

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