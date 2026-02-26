import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, tap } from 'rxjs/operators';

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
  // ✅ URL de tu backend
  private readonly apiUrl = 'http://localhost:8080/api/missions';

  constructor(private http: HttpClient) {}

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

  /** Stream reactivo que solo emite misiones pendientes */
  get misionesActivas$(): Observable<Mision[]> {
    return this.misiones$.pipe(
      map((lista) => lista.filter((m) => m.estado === 'pendiente'))
    );
  }

  // ============================================================
  //  CRUD contra BACKEND
  // ============================================================

  addMision(datos: Partial<Mision>): void {
    const nueva: Mision = {
      titulo: datos.titulo!,
      descripcion: datos.descripcion!,
      xp: datos.xp!,
      estado: datos.estado ?? 'pendiente',
      favorito: datos.favorito ?? false,
    };

    this.http.post<Mision>(this.apiUrl, nueva).subscribe(() => {
      this.cargarMisiones();
    });
  }

  completarMision(id: number): void {
    // ✅ MVP: hacemos PATCH del estado (si tu backend aún no tiene PATCH, luego lo adaptamos)
    this.http.patch(`${this.apiUrl}/${id}`, { estado: 'completada' }).subscribe(() => {
      this.cargarMisiones();
    });
  }

  eliminarMision(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.cargarMisiones();
    });
  }

  toggleFavorito(id: number, favoritoActual: boolean): void {
    this.http.patch(`${this.apiUrl}/${id}`, { favorito: !favoritoActual }).subscribe(() => {
      this.cargarMisiones();
    });
  }

  // ============================================================
  //  CÁLCULOS (se hacen sobre lo que haya en memoria)
  // ============================================================

  getTotalXP(): number {
    return this._misiones$.value
      .filter((m) => m.estado === 'completada')
      .reduce((acc, m) => acc + m.xp, 0);
  }

  getNumeroMisionesActivas(): number {
    return this._misiones$.value.filter((m) => m.estado === 'pendiente').length;
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