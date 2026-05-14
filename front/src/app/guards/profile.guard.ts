import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, take, map } from 'rxjs';
import { ProfileService } from '../services/profile.service';

export const profileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const profileService = inject(ProfileService);

  return profileService.initialized$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      const profileId = localStorage.getItem('checkpoint_profile_id');
      if (!profileId) {
        router.navigate(['/'], { state: { mensajeGuard: true } });
        return false;
      }
      return true;
    }),
  );
};
