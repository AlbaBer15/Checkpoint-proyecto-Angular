import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: number;
  nombre: string;
  avatar: string;
  genero: 'FEMENINO' | 'MASCULINO';
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  private readonly _initialized$ = new BehaviorSubject(
    !!localStorage.getItem('checkpoint_profile_id'),
  );
  readonly initialized$ = this._initialized$.asObservable();

  constructor(private http: HttpClient) {}

  // Marca el perfil como inicializado una vez seleccionado o creado
  markReady() {
    this._initialized$.next(true);
  }

  // Obtiene todos los perfiles guardados en el backend
  getAll(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  // Obtiene un perfil por su ID
  getById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuevo perfil de jugador en el backend
  create(datos: Partial<Profile>): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, datos);
  }

  // Actualiza los datos de un perfil que ya existe
  update(id: number, datos: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, datos);
  }

  // Elimina un perfil y todas sus misiones asociadas
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
