import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
  id: number;
  nombre: string;
  avatar: string;
  genero: 'FEMENINO' | 'MASCULINO';
  nivelMax?: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/profiles`;

  private readonly _initialized$ = new BehaviorSubject(
    !!localStorage.getItem('checkpoint_profile_id'),
  );
  readonly initialized$ = this._initialized$.asObservable();

  constructor(private http: HttpClient) {}

  markReady() {
    this._initialized$.next(true);
  }

  getAll(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.apiUrl);
  }

  getById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/${id}`);
  }

  create(datos: Partial<Profile>): Observable<Profile> {
    return this.http.post<Profile>(this.apiUrl, datos);
  }

  update(id: number, datos: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/${id}`, datos);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
