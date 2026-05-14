import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { MissionService } from './services/mission';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  misionesPendientes = 0;

  constructor(private missionService: MissionService) {}

  ngOnInit() {
    const profileId = Number(localStorage.getItem('checkpoint_profile_id'));
    if (profileId) {
      this.missionService.cargarMisionesPorPerfil(profileId);
    } else {
      this.missionService.cargarMisiones();
    }

    this.missionService.misionesActivas$.subscribe((lista) => {
      this.misionesPendientes = lista.length;
    });
  }
}
