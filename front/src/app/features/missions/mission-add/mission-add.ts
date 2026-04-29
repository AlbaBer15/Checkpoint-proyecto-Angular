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

  formulario: FormGroup;
  mostrarExito = false;

  mostrarError = false;
  mensajeError = '';
  misionOraculo?: Mision;

  constructor(private fb: FormBuilder, private missionService: MissionService) {
    
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
 guardar() {
    if (this.formulario.invalid) return;
    const valores = this.formulario.value;

    this.missionService.addMision({
      titulo: valores.titulo,
      descripcion: valores.descripcion,
      xp: valores.xp,
    }).subscribe({
      next: () => {
        this.formulario.reset({ xp: 1 });
        this.mostrarExitoTemporal();
      },
      error: (err) => this.mostrarErrorMensaje(err, 'Error al guardar la misión'),
    });
  }

  usarMisionDelOraculo() {
    if (!this.misionOraculo) return;

    this.missionService.addMision({
      titulo: this.misionOraculo.titulo,
      descripcion: this.misionOraculo.descripcion,
      xp: this.misionOraculo.xp,
    }).subscribe({
      next: () => {
        this.misionOraculo = undefined;
        this.formulario.reset({ xp: 1 });
        this.mostrarExitoTemporal();
      },
      error: (err) => this.mostrarErrorMensaje(err, 'Error al guardar la misión del oráculo'),
    });
  }
  private mostrarExitoTemporal() {
    this.mostrarExito = true;
    this.mostrarError = false;
    setTimeout(() => (this.mostrarExito = false), 2000);
  }

  private mostrarErrorMensaje(err: any, accion: string) {
    this.mensajeError = err?.error?.mensaje || accion;
    this.mostrarError = true;
    console.error(accion + ':', err);
    setTimeout(() => (this.mostrarError = false), 5000);
  }

} 