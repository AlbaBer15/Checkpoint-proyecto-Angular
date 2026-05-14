import { Routes } from '@angular/router';
import { profileGuard } from './guards/profile.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'missions',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./features/missions/mission-list/mission-list').then((m) => m.MissionList),
  },
  {
    path: 'missions/add',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./features/missions/mission-add/mission-add').then((m) => m.MissionAdd),
  },
  {
    path: 'achievements',
    canActivate: [profileGuard],
    loadComponent: () => import('./features/achievements/achievements').then((m) => m.Achievements),
  },
  { path: '**', redirectTo: '' },
];
