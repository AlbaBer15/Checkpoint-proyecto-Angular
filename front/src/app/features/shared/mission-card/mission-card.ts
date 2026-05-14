import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Mision } from '../../../services/mission';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../services/category';

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
  @Input() categorias: Category[] = [];

  @Output() completar = new EventEmitter<Mision>();
  @Output() eliminar = new EventEmitter<Mision>();
  @Output() marcarFavorito = new EventEmitter<Mision>();
  @Output() revertir = new EventEmitter<Mision>();
  @Output() editar = new EventEmitter<{ id: number; datos: Partial<Mision> }>();

  editando = false;
  tituloEdit = '';
  descripcionEdit = '';
  xpEdit = 0;
  errorEdicion = '';
  categoriaEdit?: number;

  activarEdicion() {
    this.tituloEdit = this.mision.titulo;
    this.descripcionEdit = this.mision.descripcion;
    this.xpEdit = this.mision.xp;
    this.categoriaEdit = this.mision.category?.id;
    this.editando = true;
  }

  cancelarEdicion() {
    this.editando = false;
  }

  guardarEdicion() {
    if (!this.mision.id) return;

    if (!this.tituloEdit.trim() || this.tituloEdit.trim().length < 3) {
      this.errorEdicion = 'El título debe tener al menos 3 caracteres.';
      return;
    }
    if (!this.descripcionEdit.trim() || this.descripcionEdit.trim().length < 5) {
      this.errorEdicion = 'La descripción debe tener al menos 5 caracteres.';
      return;
    }
    if (this.xpEdit < 1 || this.xpEdit > 999) {
      this.errorEdicion = 'El XP debe estar entre 1 y 999.';
      return;
    }

    this.errorEdicion = '';
    this.editar.emit({
      id: this.mision.id,
      datos: {
        titulo: this.tituloEdit.trim(),
        descripcion: this.descripcionEdit.trim(),
        xp: this.xpEdit,
        category: this.categoriaEdit
          ? { id: this.categoriaEdit, nombre: '', icono: '', color: '' }
          : undefined,
      },
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
