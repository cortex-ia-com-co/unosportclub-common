import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services';
import { getRoles, getUserId } from '../tools';

export const sudoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated$.pipe(
    take(1),
    switchMap((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login']);
        return of(false);
      }
      return auth.getAccessTokenSilently().pipe(
        take(1),
        map((token) => {
          const roles = getRoles(token);
          const userId = getUserId(token);
          if (roles.includes('sudo') || userId === 1) {
            return true;
          }
          router.navigate(['/unauthorized']);
          return false;
        }),
        catchError(() => {
          router.navigate(['/unauthorized']);
          return of(false);
        }),
      );
    }),
  );
};
