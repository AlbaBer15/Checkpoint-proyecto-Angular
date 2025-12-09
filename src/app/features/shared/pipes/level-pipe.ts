import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado 'level'
 *
 * A partir del XP total calcula:
 *  - nivel numérico (1..10)
 *  - título del nivel (texto ambientado)
 *  - progreso (%) dentro del nivel actual
 *
 * Se usa en el Home para mostrar el panel de nivel del aventurero.
 */
@Pipe({
  name: 'level',
  standalone: true,
})
export class LevelPipe implements PipeTransform {

  transform(xp: number): { nivel: number; titulo: string; progreso: number } {

    // Tabla de niveles con sus rangos de XP y título asociado
    const niveles = [
      { nivel: 1, min: 0,   max: 49,   titulo: 'Novata' },
      { nivel: 2, min: 50,  max: 119,  titulo: 'Exploradora' },
      { nivel: 3, min: 120, max: 199,  titulo: 'Heroína' },
      { nivel: 4, min: 200, max: 299,  titulo: 'Guardiana' },
      { nivel: 5, min: 300, max: 449,  titulo: 'Aventurera Élite' },
      { nivel: 6, min: 450, max: 649,  titulo: 'Maestra' },
      { nivel: 7, min: 650, max: 899,  titulo: 'Heroína' },
      { nivel: 8, min: 900, max: 1199, titulo: 'Leyenda' },
      { nivel: 9, min: 1200, max: 1599, titulo: 'Campeona' },
      { nivel: 10, min: 1600, max: Infinity, titulo: 'Leyenda Absoluta' },
    ];

    // 1 Buscar en qué rango de la tabla cae el XP actual
    const rango = niveles.find((n) => xp >= n.min && xp <= n.max)!;

    // 2 Calcular progreso relativo dentro de ese rango
    const rangoMax = rango.max - rango.min;      // total de XP del nivel
    const progresoXP = xp - rango.min;           // XP que ya llevamos en ese nivel
    const progreso = Math.min(
      100,
      Math.floor((progresoXP / rangoMax) * 100)  // 0–100 %
    );

    // 3 Devolver el modelo que usa el Home
    return {
      nivel: rango.nivel,
      titulo: rango.titulo,
      progreso,
    };
  }
}
