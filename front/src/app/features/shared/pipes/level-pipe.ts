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
  transform(
    xp: number,
    genero: 'FEMENINO' | 'MASCULINO' = 'FEMENINO',
  ): { nivel: number; titulo: string; progreso: number } {
    const nivelesFemenino = [
      { nivel: 1, min: 0, max: 49, titulo: 'Novata' },
      { nivel: 2, min: 50, max: 119, titulo: 'Exploradora' },
      { nivel: 3, min: 120, max: 199, titulo: 'Heroína' },
      { nivel: 4, min: 200, max: 299, titulo: 'Guardiana' },
      { nivel: 5, min: 300, max: 449, titulo: 'Aventurera Élite' },
      { nivel: 6, min: 450, max: 649, titulo: 'Maestra' },
      { nivel: 7, min: 650, max: 899, titulo: 'Heroína Estelar' },
      { nivel: 8, min: 900, max: 1199, titulo: 'Leyenda' },
      { nivel: 9, min: 1200, max: 1599, titulo: 'Campeona' },
      { nivel: 10, min: 1600, max: Infinity, titulo: 'Leyenda Absoluta' },
    ];

    const nivelesMasculino = [
      { nivel: 1, min: 0, max: 49, titulo: 'Novato' },
      { nivel: 2, min: 50, max: 119, titulo: 'Explorador' },
      { nivel: 3, min: 120, max: 199, titulo: 'Héroe' },
      { nivel: 4, min: 200, max: 299, titulo: 'Guardián' },
      { nivel: 5, min: 300, max: 449, titulo: 'Aventurero Élite' },
      { nivel: 6, min: 450, max: 649, titulo: 'Maestro' },
      { nivel: 7, min: 650, max: 899, titulo: 'Héroe Estelar' },
      { nivel: 8, min: 900, max: 1199, titulo: 'Leyenda' },
      { nivel: 9, min: 1200, max: 1599, titulo: 'Campeón' },
      { nivel: 10, min: 1600, max: Infinity, titulo: 'Leyenda Absoluta' },
    ];

    const niveles = genero === 'MASCULINO' ? nivelesMasculino : nivelesFemenino;
    const rango = niveles.find((n) => xp >= n.min && xp <= n.max)!;

    if (rango.max === Infinity) {
      return { nivel: rango.nivel, titulo: rango.titulo, progreso: 100 };
    }

    const rangoMax = rango.max - rango.min;
    const progresoXP = xp - rango.min;
    const progreso = Math.min(100, Math.floor((progresoXP / rangoMax) * 100));

    return { nivel: rango.nivel, titulo: rango.titulo, progreso };
  }
}
