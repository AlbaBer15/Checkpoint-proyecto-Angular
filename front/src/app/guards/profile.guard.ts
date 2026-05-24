import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, take, map } from 'rxjs';
import { ProfileService } from '../services/profile.service';

// Bloquea el acceso si no hay perfil activo y redirige al inicio con un aviso
export const profileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ProfileService);

  return profileService.initialized$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      const profileId = localStorage.getItem('checkpoint_profile_id');
      if (!profileId) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
  );
};
