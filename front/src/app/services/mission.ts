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

  get misionesActuales(): Mision[] {
    return this._misiones$.value;
  }

  get misionesActivas$(): Observable<Mision[]> {
    return this.misiones$.pipe(
      map((lista) => lista.filter((m) => m.estado === MISSION_ESTADOS.PENDIENTE)),
    );
  }

  cargarMisiones(): void {
    this.http.get<Mision[]>(this.apiUrl).subscribe({
      next: (lista) => this._misiones$.next(lista),
      error: (err) => console.error('Error al cargar misiones:', err),
    });
  }

  cargarMisionesPorPerfil(profileId: number): void {
    this.http.get<Mision[]>(`${this.apiUrl}/profile/${profileId}`).subscribe({
      next: (lista) => this._misiones$.next(lista),
      error: (err) => console.error('Error al cargar misiones del perfil:', err),
    });
  }

  recargarMisiones(): void {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));
    if (profileId) {
      this.cargarMisionesPorPerfil(profileId);
    } else {
      this.cargarMisiones();
    }
  }

  getTotalXP$(profileId?: number): Observable<number> {
    const url = profileId
      ? `${this.apiUrl}/stats/total-xp?profileId=${profileId}`
      : `${this.apiUrl}/stats/total-xp`;
    return this.http.get<number>(url).pipe(catchError(this.handleError('getTotalXP')));
  }

  getActiveMissionsCount$(profileId?: number): Observable<number> {
    const url = profileId
      ? `${this.apiUrl}/stats/active-count?profileId=${profileId}`
      : `${this.apiUrl}/stats/active-count`;
    return this.http.get<number>(url).pipe(catchError(this.handleError('getActiveMissionsCount')));
  }

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

  completarMision(id: number): Observable<Mision> {
    return this.http
      .patch<Mision>(`${this.apiUrl}/${id}`, { estado: MISSION_ESTADOS.COMPLETADA })
      .pipe(catchError(this.handleError('completarMision')));
  }

  eliminarMision(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('eliminarMision')),
    );
  }

  revertirMision(id: number): Observable<Mision> {
    return this.http
      .patch<Mision>(`${this.apiUrl}/${id}`, { estado: MISSION_ESTADOS.PENDIENTE })
      .pipe(
        tap(() => this.recargarMisiones()),
        catchError(this.handleError('revertirMision')),
      );
  }

  editarMision(id: number, datos: Partial<Mision>): Observable<Mision> {
    const payload: any = {
      ...datos,
      ...(datos.category ? { category: { id: datos.category.id } } : {}),
    };
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('editarMision')),
    );
  }

  toggleFavorito(id: number, favoritoActual: boolean): Observable<Mision> {
    return this.http.patch<Mision>(`${this.apiUrl}/${id}`, { favorito: !favoritoActual }).pipe(
      tap(() => this.recargarMisiones()),
      catchError(this.handleError('toggleFavorito')),
    );
  }

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
  private handleError(operacion: string) {
    return (error: any) => {
      console.error(`Error en ${operacion}:`, error);
      return throwError(() => error);
    };
  }
}
