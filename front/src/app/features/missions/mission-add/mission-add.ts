import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MissionService, Mision } from '../../../services/mission';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-mission-add',
  standalone: true,
  templateUrl: './mission-add.html',
  styleUrl: './mission-add.css',
  imports: [ReactiveFormsModule, NgIf],
})
export class MissionAdd {

  /** Formulario reactivo con validaciones */
  formulario: FormGroup;

  /** Controla la visibilidad del mensaje de éxito */
  mostrarExito = false;

  /** Misión generada desde la API externa (Oráculo) */
  misionOraculo?: Mision;

  constructor(private fb: FormBuilder, private missionService: MissionService) {
    
    /** Inicialización del formulario y sus validaciones */
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      xp: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    });
  }

  /**
   * Solicita una misión aleatoria al servicio.
   * Resetea la previa en caso de que exista.
   */
  invocarOraculo() {
    this.misionOraculo = undefined;

    this.missionService.obtenerMisionAleatoria().subscribe({
      next: (mision) => {
        this.misionOraculo = mision;
      },
      error: () => {
        // Fallback en caso de error de API
        this.misionOraculo = {
          titulo: '⚠ Error del Oráculo',
          descripcion: 'No se pudo obtener la misión.',
          xp: 5,
          estado: 'pendiente',
        };
      },
    });
  }

  /**
   *  Añade la misión generada por el Oráculo directamente al servicio.
   * Limpia la vista previa y muestra mensaje de éxito.
   */
  usarMisionDelOraculo() {
    if (!this.misionOraculo) return;

  this.missionService.addMision({
    titulo: this.misionOraculo.titulo,
    descripcion: this.misionOraculo.descripcion,
    xp: this.misionOraculo.xp,
    // no pases estado/favorito/id; que el backend o el service lo gestione
  });

  this.mostrarExito = true;
  this.misionOraculo = undefined;
  this.formulario.reset({ xp: 1 });
  setTimeout(() => (this.mostrarExito = false), 2000);
}

guardar() {
  if (this.formulario.invalid) return;

  const valores = this.formulario.value;

  this.missionService.addMision({
    titulo: valores.titulo,
    descripcion: valores.descripcion,
    xp: valores.xp,
  });

  this.mostrarExito = true;
  this.formulario.reset({ xp: 1 });
  setTimeout(() => (this.mostrarExito = false), 2000);
}


}
