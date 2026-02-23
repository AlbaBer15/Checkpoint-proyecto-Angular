import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

/**
 * Modelo principal de una misión del sistema.
 * Cada misión representa una tarea gamificada que el usuario puede completar.
 */
export interface Mision {
  titulo: string;
  descripcion: string;
  xp: number;
  estado: 'pendiente' | 'completada';
  favorito?: boolean;
}

/**
 * Servicio encargado de gestionar toda la lógica de misiones:
 * - Gestión interna mediante BehaviorSubject
 * - Alta, eliminación y actualización de estado
 * - Cálculo de XP total
 * - Integración con API externa (misión del Oráculo)
 * 
 * Este servicio actúa como "fuente de verdad" para toda la aplicación.
 */
@Injectable({
  providedIn: 'root',
})
export class MissionService {
  constructor(private http: HttpClient) {}

  // ============================================================
  //  LISTA REACTIVA DE MISIONES
  // ============================================================

  /**
   * BehaviorSubject que mantiene el estado actual de todas las misiones.
   * Permite que los componentes se actualicen automáticamente al cambiar datos.
   */
  private readonly _misiones$ = new BehaviorSubject<Mision[]>([
    {
      titulo: 'Hidratarte como un campeón',
      descripcion: 'Bebe un vaso de agua para mejorar tus stats de energía.',
      xp: 5,
      estado: 'pendiente',
      favorito: false,
    },
    {
      titulo: 'Mini misión: ordenar tu zona',
      descripcion: 'Arregla tu escritorio para obtener claridad mental.',
      xp: 10,
      estado: 'pendiente',
      favorito: false,
    },
    {
      titulo: 'Revisión rápida de inventario',
      descripcion: 'Revisa tu mochila y tira lo que no necesites.',
      xp: 8,
      estado: 'pendiente',
      favorito: false,
    },
    {
      titulo: 'Mensaje de alianza',
      descripcion: 'Envía un WhatsApp amable a alguien que aprecias.',
      xp: 6,
      estado: 'pendiente',
      favorito: false,
    },
    {
      titulo: 'Estiramientos del guerrero',
      descripcion: 'Haz 2 minutos de estiramientos para recuperar salud.',
      xp: 12,
      estado: 'pendiente',
      favorito: false,
    }
  ]);

  /** Devuelve todas las misiones como un observable para suscripción reactiva. */
  get misiones$(): Observable<Mision[]> {
    return this._misiones$.asObservable();
  }

  /** Versión para cálculos rápidos en componentes (ej. Home). */
  get misionesActuales(): Mision[] {
    return this._misiones$.value;
  }

  /** Stream reactivo que solo emite misiones pendientes. */
  get misionesActivas$(): Observable<Mision[]> {
    return this.misiones$.pipe(
      map(lista => lista.filter(m => m.estado === 'pendiente'))
    );
  }

  // ============================================================
  //  ALTA DE MISIONES
  // ============================================================

  /**
   * Añade una nueva misión a la lista.
   * @param datos Objeto parcial recibido desde el formulario.
   */
  addMision(datos: Partial<Mision>): void {
    const nueva: Mision = {
      titulo: datos.titulo!,
      descripcion: datos.descripcion!,
      xp: datos.xp!,
      estado: datos.estado ?? 'pendiente',
      favorito: datos.favorito ?? false,
    };

    this._misiones$.next([...this._misiones$.value, nueva]);
  }

  // ============================================================
  //  CÁLCULOS DE XP Y ESTADÍSTICAS
  // ============================================================

  /**
   * Calcula la experiencia total del usuario.
   * Solo cuenta misiones completadas.
   */
  getTotalXP(): number {
    return this._misiones$.value
      .filter(m => m.estado === 'completada')
      .reduce((acc, m) => acc + m.xp, 0);
  }

  /** Devuelve cuántas misiones quedan por completar. */
  getNumeroMisionesActivas(): number {
    return this._misiones$.value.filter(m => m.estado === 'pendiente').length;
  }

  // ============================================================
  //  API EXTERNA: MISIÓN DEL ORÁCULO (TRADUCE Y GENERA UNA MISIÓN)
  // ============================================================

  /**
   * Obtiene una misión aleatoria desde API externa, la traduce y la adapta
   * al formato de la aplicación.
   */
  obtenerMisionAleatoria(): Observable<Mision> {
    return this.http.get('https://dummyjson.com/todos/random').pipe(

      // 1. extraemos la frase en inglés
      map((data: any) => data.todo),

      // 2. llamamos a la API de traducción
      switchMap((fraseEnIngles: string) =>
        this.http.get(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEnIngles)}&langpair=en|es`
        ).pipe(

          // 3. construimos la misión final
          map((resp: any) => {
            const descripcionES = resp.responseData.translatedText;

            const titulosPosibles = [
              '🔥 Desafío del Guerrero Interior',
              '⚔ Ritual del Héroe Errante',
              '🌌 Prueba del Caminante Estelar',
              '🎮 Misión del Aventurero',
              '✨ Encargo del Reino',
              '🔧 Ritual de Mantenimiento',
            ];

            const titulo = titulosPosibles[Math.floor(Math.random() * titulosPosibles.length)];
            const xp = Math.min(50, Math.max(5, descripcionES.length));

            return {
              titulo,
              descripcion: descripcionES,
              xp,
              estado: 'pendiente',
            } as Mision;

          })
        )
      )
    );
  }

  // ============================================================
  //  OPERACIONES SOBRE MISIONES
  // ============================================================

  /**
   * Marca una misión como completada.
   * @param titulo Título de la misión a actualizar
   */
  completarMision(titulo: string): void {
    this._misiones$.next(
      this._misiones$.value.map(m =>
        m.titulo === titulo ? { ...m, estado: 'completada' } : m
      )
    );
  }

  /**
   * Elimina una misión por título.
   */
  eliminarMision(titulo: string): void {
    this._misiones$.next(
      this._misiones$.value.filter(m => m.titulo !== titulo)
    );
  }

  /**
   * Alterna el estado "favorito" de una misión.
   */
  toggleFavorito(titulo: string): void {
    this._misiones$.next(
      this._misiones$.value.map(m =>
        m.titulo === titulo ? { ...m, favorito: !m.favorito } : m
      )
    );
  }
}
