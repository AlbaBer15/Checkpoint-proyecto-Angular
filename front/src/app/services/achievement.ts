import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AchievementApi {
  id: number;
  titulo: string;
  descripcion: string;
  xpRequerido: number;
  icono: string;
}

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly apiUrl = 'http://localhost:8080/api/achievements';

  constructor(private http: HttpClient) {}

  getCatalogo(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(this.apiUrl);
  }

  unlock(profileId: number, achievementId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/profile/${profileId}/unlock/${achievementId}`, {}
    );
  }

  getDesbloqueados(profileId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/profile/${profileId}`);
  }
}
