import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'missions',
    loadComponent: () =>
      import('./features/missions/mission-list/mission-list').then((m) => m.MissionList),
  },
  {
    path: 'missions/add',
    loadComponent: () =>
      import('./features/missions/mission-add/mission-add').then((m) => m.MissionAdd),
  },
  { path: '**', redirectTo: '' },
];
// TODO: tengo que meter la ruta para profile sera algo asi:
// { path: 'profile', loadComponent: () => import('./features/profile/profile').then((m) => m.Profile) },
