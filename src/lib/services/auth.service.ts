import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  User,
  authState,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from '@angular/fire/auth';
import { Observable, from, switchMap, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AuthClientInterface {
  first_name: string;
  last_name: string;
  document: string;
  document_type_id: number;
  display_name?: string;
  email: string;
  phone_number?: string;
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
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private config: AuthServiceConfig | null = null;
  private readonly permissionsSubject = new BehaviorSubject<Permissions>({
    isOperator: false,
    isAdmin: false,
    isSudo: false,
    isTrainer: false,
    hasAnyRole: false,
    hasPanelAccess: false,
  });

  readonly authState$: Observable<User | null> = authState(this.auth);
  readonly permissions$ = this.permissionsSubject.asObservable();
  readonly currentUserSignal = signal<User | null>(null);

  constructor() {
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
      this.updatePermissions(this.auth.currentUser);
    }
  }

  private updatePermissions(user: User | null): void {
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
      .getIdTokenResult()
      .then((tokenResult) => {
        const claims = tokenResult.claims;
        const permissions: Permissions = {
          isOperator: Boolean(claims['operator']),
          isAdmin: Boolean(claims['admin']),
          isSudo: Boolean(claims['sudo']),
          isTrainer: Boolean(claims['trainer']),
          hasAnyRole: Boolean(
            claims['operator'] || claims['admin'] || claims['sudo'] || claims['trainer'],
          ),
          hasPanelAccess: Boolean(claims['operator'] || claims['admin'] || claims['sudo']),
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
    const user = this.auth.currentUser;
    if (!user?.email) {
      return false;
    }
    return user.email.endsWith(this.config.allowedDomain);
  }

  checkPermissions(): Permissions {
    return this.permissionsSubject.value;
  }

  getCurrentClaims(): Record<string, unknown> | null {
    const user = this.auth.currentUser;
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

    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (!user) {
          return from(Promise.resolve());
        }
        return from(user.getIdToken()).pipe(
          switchMap((token) => {
            const displayName = `${clientData.first_name} ${clientData.last_name}`.trim();
            return from(updateProfile(user, { displayName })).pipe(
              switchMap(() => {
                const clientDataForRegistration: AuthClientInterface = {
                  first_name: clientData.first_name,
                  last_name: clientData.last_name,
                  document: clientData.document,
                  document_type_id: clientData.document_type_id,
                  email: (user.email || email || '') as string,
                  phone_number: clientData.phone_number,
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

  registerClient(token: string, user: User, client: AuthClientInterface): Observable<unknown> {
    if (!this.config) {
      return from(Promise.reject(new Error('AuthService not initialized')));
    }

    const data = {
      email: user.email ?? '',
      display_name: user.displayName ?? '',
      phone_number: client.phone_number,
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
    return from(signInWithEmailAndPassword(this.auth, email, password).then(() => void 0));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  updatePassword(newPassword: string, currentPassword?: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }

    if (currentPassword) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      return from(reauthenticateWithCredential(user, credential)).pipe(
        switchMap(() => from(updatePassword(user, newPassword))),
      );
    }

    return from(updatePassword(user, newPassword));
  }

  confirmPasswordReset(oobCode: string, newPassword: string): Observable<void> {
    return from(confirmPasswordReset(this.auth, oobCode, newPassword));
  }

  refreshToken(): Observable<string> {
    const user = this.auth.currentUser;
    if (!user) {
      return from(Promise.reject(new Error('No hay usuario autenticado')));
    }
    return from(user.getIdToken(true));
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}
