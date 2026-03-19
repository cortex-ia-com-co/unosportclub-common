import {
  Directive,
  inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { hasPermission } from '../auth.utils';

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly auth = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private hasView = false;

  @Input() set hasPermission(permission: string) {
    if (permission == null || permission === '') {
      this.updateView(false);
      return;
    }
    this.auth.isAuthenticated$.pipe(
      switchMap((isAuth) => {
        if (!isAuth) return of(false);
        return this.auth.getAccessTokenSilently().pipe(
          map((token) => hasPermission(token, permission)),
          catchError(() => of(false))
        );
      })
    ).subscribe((allowed) => this.updateView(allowed));
  }

  private updateView(allowed: boolean): void {
    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
