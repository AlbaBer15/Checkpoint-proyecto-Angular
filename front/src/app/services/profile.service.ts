import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly _initialized$ = new BehaviorSubject(
    !!localStorage.getItem('checkpoint_profile_id'),
  );
  readonly initialized$ = this._initialized$.asObservable();

  markReady() {
    this._initialized$.next(true);
  }
}
