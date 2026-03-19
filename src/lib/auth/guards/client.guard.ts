import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { getRoles } from '../auth.utils';

export const clientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated$.pipe(
    take(1),
    switchMap((isAuth) => {
      if (!isAuth) {
        router.navigate(['/login']);
        return of(false);
      }
      return auth.getAccessTokenSilently().pipe(
        take(1),
        map((token) => {
          const roles = getRoles(token);
          if (roles.includes('client')) return true;
          router.navigate(['/unauthorized']);
          return false;
        }),
        catchError(() => {
          router.navigate(['/unauthorized']);
          return of(false);
        })
      );
    })
  );
};
