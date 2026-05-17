import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MISSION_ESTADOS } from '../features/shared/constants/constants';
import { environment } from '../../environments/environment';

export interface Mision {
  id?: number;
  titulo: string;
  descripcion: string;
  xp: number;
  estado: 'pendiente' | 'completada';
  favorito?: boolean;
  category?: { id: number; nombre: string; icono: string; color: string };
  profile?: { id: number; nombre: string; avatar: string; genero: string };
}

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  private readonly apiUrl = `${environment.apiUrl}/missions`;

  private readonly _misiones$ = new BehaviorSubject<Mision[]>([]);
  misiones$ = this._misiones$.asObservable();

  constructor(private http: HttpClient) {}

  // Devuelve lista actual de misiones cargadas
  get misionesActuales(): Mision[] {
    return this._misiones$.value;
  }

  // Devuelve observable con misiones pendientes
  get misionesActivas$(): Observable<Mision[]> {
    return this.misiones$.pipe(
      map((lista) => lista.filter((m) => m.estado === MISSION_ESTADOS.PENDIENTE)),
    );
  }
  // Obtiene todas las misiones desde el backend y actualiza el estado global
  cargarMisiones(): void {
    this.http.get<Mision[]>(this.apiUrl).subscribe({
      next: (lista) => this._misiones$.next(lista),
      error: (err) => console.error('Error al cargar misiones:', err),
    });
  }

  // Obtiene las misiones filtrando por el perfil del usuario activo
  cargarMisionesPorPerfil(profileId: number): void {
    this.http.get<Mision[]>(`${this.apiUrl}/profile/${profileId}`).subscribe({
      next: (lista) => this._misiones$.next(lista),
      error: (err) => console.error('Error al cargar misiones del perfil:', err),
    });
  }

  // Decide qué método de carga usar según si hay un perfil guardado en localStorage
  recargarMisiones(): void {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));
    if (profileId) {
      this.cargarMisionesPorPerfil(profileId);
    } else {
      this.cargarMisiones();
    }
  }

  // Suma el XP de las misiones completadas; aplica el filtro de perfil si existe
  getTotalXP$(profileId?: number): Observable<number> {
    const url = profileId
      ? `${this.apiUrl}/stats/total-xp?profileId=${profileId}`
      : `${this.apiUrl}/stats/total-xp`;
    return this.http.get<number>(url).pipe(catchError(this.handleError('getTotalXP')));
  }

  // Obtiene el número de misiones pendientes, filtrado por perfil si existe
  getActiveMissionsCount$(profileId?: number): Observable<number> {
    const url = profileId
      ? `${this.apiUrl}/stats/active-count?profileId=${profileId}`
      : `${this.apiUrl}/stats/active-count`;
    return this.http.get<number>(url).pipe(catchError(this.handleError('getActiveMissionsCount')));
  }

  // Crea una nueva misión en el backend y recarga la lista actualizada
  addMision(datos: Partial<Mision>): Observable<Mision> {
    const nueva: any = {
      titulo: datos.titulo!,
      descripcion: datos.descripcion!,
      xp: datos.xp!,
      estado: datos.estado ?? MISSION_ESTADOS.PENDIENTE,
      favorito: datos.favorito ?? false,
      ...(datos.category ? { category: { id: datos.category.id } } : {}),
      ...(datos.profile ? { profile: { id: datos.profile.id } } : {}),
    };
    return this.http.post<Mision>(this.apiUrl, nueva).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('addMision')),
    );
  }

  // Actualiza el estado de la misión en el backend para marcarla como completada
  completarMision(id: number): Observable<Mision> {
    return this.http
      .patch<Mision>(`${this.apiUrl}/${id}`, { estado: MISSION_ESTADOS.COMPLETADA })
      .pipe(catchError(this.handleError('completarMision')));
  }

  // Elimina una misión en el backend y recarga la lista
  eliminarMision(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('eliminarMision')),
    );
  }

  // Revierte una misión completada a pendiente
  revertirMision(id: number): Observable<Mision> {
    return this.http
      .patch<Mision>(`${this.apiUrl}/${id}`, { estado: MISSION_ESTADOS.PENDIENTE })
      .pipe(
        tap(() => this.recargarMisiones()),
        catchError(this.handleError('revertirMision')),
      );
  }

  // Actualiza campos editables de una misión existente
  editarMision(id: number, datos: Partial<Mision>): Observable<Mision> {
    const payload: any = {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      xp: datos.xp,
      category: datos.category ? { id: datos.category.id } : null,
    };
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('editarMision')),
    );
  }

  // Cambia el estado "favorito" de una misión al valor contrario
  toggleFavorito(id: number, favoritoActual: boolean): Observable<Mision> {
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, { favorito: !favoritoActual }).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('toggleFavorito')),
    );
  }

  // Llama a DummyJSON para obtener una misión aleatoria y la traduce al español automáticamente
  obtenerMisionAleatoria(): Observable<Mision> {
    return this.http.get('https://dummyjson.com/todos/random').pipe(
      map((data: any) => data.todo),
      switchMap((fraseEnIngles: string) =>
        this.http
          .get(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(fraseEnIngles)}&langpair=en|es`,
          )
          .pipe(
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
                estado: MISSION_ESTADOS.PENDIENTE,
                favorito: false,
              } as Mision;
            }),
          ),
      ),
    );
  }

  // Maneja los errores de las peticiones HTTP y los registra en consola
  private handleError(operacion: string) {
    return (error: any) => {
      console.error(`Error en ${operacion}:`, error);
      return throwError(() => error);
    };
  }
}
