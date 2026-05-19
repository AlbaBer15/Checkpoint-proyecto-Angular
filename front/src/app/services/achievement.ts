import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AchievementApi {
  id: number;
  titulo: string;
  descripcion: string;
  xpRequerido: number;
  icono: string;
}

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly apiUrl = `${environment.apiUrl}/achievements`;

  constructor(private http: HttpClient) {}

  // Obtiene el catálogo completo de logros disponibles en la app
  getCatalogo(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(this.apiUrl);
  }

  // Desbloquea un logro específico para el perfil cuando se cumple la condición de XP
  unlock(profileId: number, achievementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/profile/${profileId}/unlock/${achievementId}`, {}
    );
  }

  // Obtiene los logros que ya ha desbloqueado un perfil
  getDesbloqueados(profileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/profile/${profileId}`);
  }
}
