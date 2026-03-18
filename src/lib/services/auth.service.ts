import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal, InjectionToken, Optional, Inject } from '@angular/core';
import { BehaviorSubject, Observable, from, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import type { AuthProvider, AuthUser } from './auth-provider.interface';

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');

export interface AuthClientInterface {
  first_name: string;
  last_name: string;
  document: string;
  document_type_id: number;
  display_name?: string;
  email: string;
  phone?: string;
  [key: string]: unknown;
}

export interface AuthServiceConfig {
  apiUrl: string;
  allowedDomain?: string;
  enablePermissions?: boolean;
  enableClientRegistration?: boolean;
  enableSignalCurrentUser?: boolean;
}

export interface Permissions {
  isOperator: boolean;
  isAdmin: boolean;
  isSudo: boolean;
  isTrainer: boolean;
  hasAnyRole: boolean;
  hasPanelAccess: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authProvider: AuthProvider;
  private readonly http: HttpClient;
  private config: AuthServiceConfig | null = null;
  private readonly permissionsSubject = new BehaviorSubject<Permissions>({
    isOperator: false,
    isAdmin: false,
    isSudo: false,
    isTrainer: false,
    hasAnyRole: false,
    hasPanelAccess: false,
  });

  readonly authState$: Observable<AuthUser | null>;
  readonly permissions$ = this.permissionsSubject.asObservable();
  readonly currentUserSignal = signal<AuthUser | null>(null);

  constructor(
    @Optional() @Inject(AUTH_PROVIDER) authProvider?: AuthProvider,
    @Optional() http?: HttpClient,
  ) {
    this.authProvider = authProvider ?? inject(AUTH_PROVIDER);
    this.http = http ?? inject(HttpClient);
    this.authState$ = this.authProvider.authState$;
    this.authState$.subscribe((user) => {
      this.currentUserSignal.set(user);
      if (this.config?.enablePermissions) {
        this.updatePermissions(user);
      }
    });
  }

  initialize(config: AuthServiceConfig): void {
    this.config = config;
    if (config.enablePermissions) {
      this.updatePermissions(this.authProvider.currentUser);
    }
  }

  private static roleFromClaims(claims: Record<string, unknown>, role: 'operator' | 'admin' | 'sudo' | 'trainer'): boolean {
    if (Boolean(claims[role])) {
      return true;
    }
    const raw = claims['customAttributes'];
    if (raw == null) {
      return false;
    }
    try {
      const attrs = typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : raw as Record<string, unknown>;
      return Boolean(attrs[role]);
    } catch {
      return false;
    }
  }

  private updatePermissions(user: AuthUser | null): void {
    if (!user) {
      this.permissionsSubject.next({
        isOperator: false,
        isAdmin: false,
        isSudo: false,
        isTrainer: false,
        hasAnyRole: false,
        hasPanelAccess: false,
      });
      return;
    }

    user
      .getIdTokenResult(true)
      .then((tokenResult) => {
        const claims = tokenResult.claims as Record<string, unknown>;
        const isOperator = AuthService.roleFromClaims(claims, 'operator');
        const isAdmin = AuthService.roleFromClaims(claims, 'admin');
        const isSudo = AuthService.roleFromClaims(claims, 'sudo');
        const isTrainer = AuthService.roleFromClaims(claims, 'trainer');
        const permissions: Permissions = {
          isOperator,
          isAdmin,
          isSudo,
          isTrainer,
          hasAnyRole: isOperator || isAdmin || isSudo || isTrainer,
          hasPanelAccess: isOperator || isAdmin || isSudo,
        };
        this.permissionsSubject.next(permissions);
      })
      .catch(() => {
        this.permissionsSubject.next({
          isOperator: false,
          isAdmin: false,
          isSudo: false,
          isTrainer: false,
          hasAnyRole: false,
          hasPanelAccess: false,
        });
      });
  }

  hasAllowedDomain(): boolean {
    if (!this.config?.allowedDomain) {
      return true;
    }
    const user = this.authProvider.currentUser;
    if (!user?.email) {
      return false;
    }
    return user.email.endsWith(this.config.allowedDomain);
  }

  checkPermissions(): Permissions {
    return this.permissionsSubject.value;
  }

  getCurrentClaims(): Record<string, unknown> | null {
    const user = this.authProvider.currentUser;
    if (!user) {
      return null;
    }
    return user
      .getIdTokenResult()
      .then((tokenResult) => tokenResult.claims)
      .catch(() => null) as unknown as Record<string, unknown> | null;
  }

  isAdmin(): Observable<boolean> {
    return this.permissions$.pipe(map((p) => p.isAdmin));
  }

  hasPanelAccess(): Observable<boolean> {
    return this.permissions$.pipe(map((p) => p.hasPanelAccess));
  }

  isTrainer(): Observable<boolean> {
    return this.permissions$.pipe(map((p) => p.isTrainer));
  }

  register(email: string, password: string, clientData: AuthClientInterface): Observable<void> {
    if (!this.config?.enableClientRegistration) {
      return from(Promise.reject(new Error('Client registration is disabled')));
    }

    return from(this.authProvider.createUserWithEmailAndPassword(email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (!user) {
          return from(Promise.resolve());
        }
        return from(user.getIdToken()).pipe(
          switchMap((token) => {
            const displayName = `${clientData.first_name} ${clientData.last_name}`.trim();
            return from(this.authProvider.updateProfile(user, { displayName })).pipe(
              switchMap(() => {
                const clientDataForRegistration: AuthClientInterface = {
                  first_name: clientData.first_name,
                  last_name: clientData.last_name,
                  document: clientData.document,
                  document_type_id: clientData.document_type_id,
                  email: (user.email || email || '') as string,
                  phone: clientData.phone,
                };
                return this.registerClient(token, user, clientDataForRegistration);
              }),
            );
          }),
        );
      }),
      switchMap(() => from(Promise.resolve())),
    );
  }

  registerClient(token: string, user: AuthUser, client: AuthClientInterface): Observable<unknown> {
    if (!this.config) {
      return from(Promise.reject(new Error('AuthService not initialized')));
    }

    const data = {
      email: user.email ?? '',
      display_name: user.displayName ?? '',
      phone: client.phone,
      first_name: client.first_name ?? '',
      last_name: client.last_name ?? '',
      document: client.document ?? '',
      document_type_id: client.document_type_id ?? 1,
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.config.apiUrl}/account/client`, data, { headers });
  }

  login(email: string, password: string): Observable<void> {
    if (this.config?.allowedDomain && !email.endsWith(this.config.allowedDomain)) {
      return from(Promise.reject(new Error(`Solo se permiten usuarios con correo ${this.config.allowedDomain}`)));
    }
    return from(this.authProvider.signIn(email, password));
  }

  logout(): Observable<void> {
    return from(this.authProvider.signOut());
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return from(this.authProvider.sendPasswordResetEmail(email));
  }

  updatePassword(newPassword: string, currentPassword?: string): Observable<void> {
    const user = this.authProvider.currentUser;
    if (!user || !user.email) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }
    return from(this.authProvider.updatePassword(user, newPassword, currentPassword));
  }

  confirmPasswordReset(oobCode: string, newPassword: string): Observable<void> {
    return from(this.authProvider.confirmPasswordReset(oobCode, newPassword));
  }

  refreshToken(): Observable<string> {
    const user = this.authProvider.currentUser;
    if (!user) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }
    const promise = user.getIdToken(true).then((token) => {
      if (!this.config?.enablePermissions) {
        return token;
      }
      return user.getIdTokenResult(true).then((tokenResult) => {
        const claims = tokenResult.claims as Record<string, unknown>;
        const isOperator = AuthService.roleFromClaims(claims, 'operator');
        const isAdmin = AuthService.roleFromClaims(claims, 'admin');
        const isSudo = AuthService.roleFromClaims(claims, 'sudo');
        const isTrainer = AuthService.roleFromClaims(claims, 'trainer');
        this.permissionsSubject.next({
          isOperator,
          isAdmin,
          isSudo,
          isTrainer,
          hasAnyRole: isOperator || isAdmin || isSudo || isTrainer,
          hasPanelAccess: isOperator || isAdmin || isSudo,
        });
        return token;
      });
    });
    return from(promise);
  }

  get currentUser(): AuthUser | null {
    return this.authProvider.currentUser;
  }
}
