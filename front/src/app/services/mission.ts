import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

/**
 * Modelo principal de una misión del sistema.
 */
export interface Mision {
  id?: number;
  titulo: string;
  descripcion: string;
  xp: number;
  estado: 'pendiente' | 'completada';
  favorito?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  private readonly apiUrl = 'http://localhost:8080/api/missions';

  constructor(private http: HttpClient) {}

  private handleError<T>(operacion: string) {
    return (error: any): Observable<T> => {
      console.error(`Error en ${operacion}:`, error);
      return throwError(() => error);
    };
  }

  // ============================================================
  //  LISTA REACTIVA DE MISIONES (FUENTE DE VERDAD = BACKEND)
  // ============================================================

  private readonly _misiones$ = new BehaviorSubject<Mision[]>([]);
  misiones$ = this._misiones$.asObservable();

  /** Carga misiones desde el backend y actualiza el estado local */
  cargarMisiones(): void {
    this.http.get<Mision[]>(this.apiUrl).subscribe((lista) => {
      this._misiones$.next(lista);
    });
  }

  /** Versión para cálculos rápidos en componentes */
  get misionesActuales(): Mision[] {
    return this._misiones$.value;
  }


  getTotalXP$(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total-xp`).pipe(
      catchError(this.handleError<number>('getTotalXP'))
    );
  }


  getActiveMissionsCount$(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/active-count`).pipe(
      catchError(this.handleError<number>('getActiveMissionsCount'))
    );
  }

  get misionesActivas$(): Observable<Mision[]> {
    return this.misiones$.pipe(
      map((lista) => lista.filter((m) => m.estado === 'pendiente'))
    );
  }

  addMision(datos: Partial<Mision>): Observable<Mision> {
    const nueva: Mision = {
      titulo: datos.titulo!,
      descripcion: datos.descripcion!,
      xp: datos.xp!,
      estado: datos.estado ?? 'pendiente',
      favorito: datos.favorito ?? false,
    };

    return this.http.post<Mision>(this.apiUrl, nueva).pipe(
      tap(() => this.cargarMisiones()),
      catchError(this.handleError<Mision>('addMision'))
    );
  }

  completarMision(id: number): Observable<Mision> {
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, { estado: 'completada' }).pipe(
      tap(() => this.cargarMisiones()),
      catchError(this.handleError<Mision>('completarMision'))
    );
  }

  eliminarMision(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarMisiones()),
      catchError(this.handleError<void>('eliminarMision'))
    );
  }

  toggleFavorito(id: number, favoritoActual: boolean): Observable<Mision> {
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, { favorito: !favoritoActual }).pipe(
      tap(() => this.cargarMisiones()),
      catchError(this.handleError<Mision>('toggleFavorito'))
    );
  }

  // ============================================================
  //  ORÁCULO (lo dejamos igual, pero al final puedes guardarlo en BD)
  // ============================================================

  obtenerMisionAleatoria(): Observable<Mision> {
    return this.http.get('https://dummyjson.com/todos/random').pipe(
      map((data: any) => data.todo),
      switchMap((fraseEnIngles: string) =>
        this.http.get(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEnIngles)}&langpair=en|es`
        ).pipe(
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
              favorito: false,
            } as Mision;
          })
        )
      )
    );
  }
}