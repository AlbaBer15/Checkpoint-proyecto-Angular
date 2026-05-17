import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,  FormsModule } from '@angular/forms';
import { MissionService, Mision } from '../../../services/mission';
import { NgIf, NgFor } from '@angular/common';
import { CategoryService, Category } from '../../../services/category';

@Component({
  selector: 'app-mission-add',
  standalone: true,
  templateUrl: './mission-add.html',
  styleUrl: './mission-add.css',
  imports: [ReactiveFormsModule, NgIf, NgFor,  FormsModule],
})
export class MissionAdd implements OnInit {
  formulario: FormGroup;
  mostrarExito = false;
  mostrarError = false;
  mensajeError = '';
  misionOraculo?: Mision;
  categorias: Category[] = [];
  categoriaSeleccionada?: number;

  constructor(
    private fb: FormBuilder,
    private missionService: MissionService,
    private categoryService: CategoryService,
  ) {
    this.formulario = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      xp: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    });
  }

  // Carga las categorías para el selector del formulario
  ngOnInit() {
    this.categoryService.getAll().subscribe((cats) => (this.categorias = cats));
  }

  // Obtiene el perfil activo desde localStorage para asociarlo a la misión
  private getProfileObject() {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));
    return profileId ? { id: profileId, nombre: '', avatar: '', genero: 'FEMENINO' } : undefined;
  }

  // Obtiene la categoría seleccionada para asociarla a la misión
  private getCategoryObject() {
    return this.categoriaSeleccionada
      ? { id: this.categoriaSeleccionada, nombre: '', icono: '', color: '' }
      : undefined;
  }

  // Solicita una misión aleatoria al oráculo y muestra el resultado mientras carga
  invocarOraculo() {
    if (!this.misionOraculo) {
      this.misionOraculo = {
        titulo: '...',
        descripcion: 'El oráculo está consultando los astros...',
        xp: 0,
        estado: 'pendiente',
      };
    }
    this.missionService.obtenerMisionAleatoria().subscribe({
      next: (mision) => {
        this.misionOraculo = mision;
      },
      error: () => {
        this.misionOraculo = {
          titulo: '⚠ Error del Oráculo',
          descripcion: 'No se pudo obtener la misión.',
          xp: 5,
          estado: 'pendiente',
        };
      },
    });
  }

  // Guarda la misión propuesta por el oráculo con la categoría y perfil seleccionados
  usarMisionDelOraculo() {
    if (!this.misionOraculo) return;

    this.missionService
      .addMision({
        titulo: this.misionOraculo.titulo,
        descripcion: this.misionOraculo.descripcion,
        xp: this.misionOraculo.xp,
        category: this.getCategoryObject(),
        profile: this.getProfileObject(),
      })
      .subscribe({
        next: () => {
          this.misionOraculo = undefined;
          this.formulario.reset({ xp: 1 });
          this.categoriaSeleccionada = undefined;
          this.mostrarExitoTemporal();
        },
        error: (err) => this.mostrarErrorMensaje(err, 'Error al guardar la misión del oráculo'),
      });
  }

  // Valida el formulario y guarda la nueva misión creada por el usuario
  guardar() {
    if (this.formulario.invalid) return;
    const valores = this.formulario.value;

    this.missionService
      .addMision({
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        xp: valores.xp,
        category: this.getCategoryObject(),
        profile: this.getProfileObject(),
      })
      .subscribe({
        next: () => {
          this.formulario.reset({ xp: 1 });
          this.categoriaSeleccionada = undefined;
          this.mostrarExitoTemporal();
        },
        error: (err) => this.mostrarErrorMensaje(err, 'Error al guardar la misión'),
      });
  }

  // Muestra el mensaje de éxito y lo oculta después de 2 segundos
  private mostrarExitoTemporal() {
    this.mostrarExito = true;
    this.mostrarError = false;
    setTimeout(() => (this.mostrarExito = false), 2000);
  }

  // Muestra el error recibido y lo oculta después de 5 segundos
  private mostrarErrorMensaje(err: any, accion: string) {
    this.mensajeError = err?.error?.mensaje || accion;
    this.mostrarError = true;
    console.error(accion + ':', err);
    setTimeout(() => (this.mostrarError = false), 5000);
  }
}
