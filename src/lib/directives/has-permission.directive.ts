import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services';
import { hasPermission } from '../tools';

@Directive({
  selector: '[hasPermission]',
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
    this.auth.isAuthenticated$
      .pipe(
        switchMap((isAuthenticated) => {
          if (!isAuthenticated) {
            return of(false);
          }
          return this.auth.getAccessTokenSilently().pipe(
            map((token) => hasPermission(token, permission)),
            catchError(() => of(false)),
          );
        }),
      )
      .subscribe((allowed) => this.updateView(allowed));
  }

  private updateView(allowed: boolean): void {
    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
      return;
    }
    if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
