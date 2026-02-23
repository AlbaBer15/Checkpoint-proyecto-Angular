import { Component, OnInit } from '@angular/core';
import { MissionService } from '../../services/mission';
import { LevelPipe } from '../shared/pipes/level-pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [LevelPipe],
})
export class Home implements OnInit {

  // Valores mostrados en el dashboard
  totalXP = 0;
  totalMisiones = 0;
  mensajeEstado = '';

  constructor(private missionService: MissionService) {}

  ngOnInit() {
    const pipe = new LevelPipe(); // Pipe usado aquí para evitar duplicar lógica en el componente

    // Función que recalcula estadísticas cuando cambian las misiones
    const actualizarStats = () => {

      // XP total basado solo en misiones completadas
      this.totalXP = this.missionService.getTotalXP();

      // Cantidad de misiones aún no completadas
      this.totalMisiones = this.missionService.getNumeroMisionesActivas();

      // Obtener nivel actual usando el pipe
      const { nivel } = pipe.transform(this.totalXP);

      // Mensaje dinámico personalizado según nivel 
      switch (nivel) {
        case 1:
          this.mensajeEstado = 'El viaje comienza... Cada paso te hace más fuerte. ';
          break;

        case 2:
          this.mensajeEstado = 'Exploradora... Tu curiosidad es tu gran virtud.';
          break;

        case 3:
          this.mensajeEstado = 'Heroína... Estás dejando huella en el mundo. 🗡️';
          break;

        case 4:
          this.mensajeEstado = 'Guardiana del camino… Tu presencia inspira a otros.';
          break;

        case 5:
          this.mensajeEstado = 'Dominas cada desafío con valentía, aventurera.';
          break;

        case 6:
          this.mensajeEstado = 'Maestra del Camino… Tu sabiduría guía tu destino. 🔮';
          break;

        case 7:
          this.mensajeEstado = 'Heroína Estelar… Brillas incluso en la oscuridad. ⭐';
          break;

        case 8:
          this.mensajeEstado = 'Leyenda Errante… Tu nombre comienza a susurrarse en las tabernas. ⚔️';
          break;

        case 9:
          this.mensajeEstado = '💫 Campeona Arcana… Tu poder trasciende este mundo. 🔥';
          break;

        default: // Nivel 10+
          this.mensajeEstado = '✨Tu historia ya es parte de las estrellas. 🌌';
      }
    };

    actualizarStats(); // Primera carga

    // Escucha cambios en las misiones y actualiza el panel
    this.missionService.misiones$.subscribe(() => actualizarStats());
  }
}
