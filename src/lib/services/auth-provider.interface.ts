import { Observable } from 'rxjs';

export interface AuthUserTokenResult {
  claims: Record<string, unknown>;
  token: string;
  expirationTime: string;
  issuedAtTime: string;
  signInProvider: string | null;
  signInSecondFactor: string | null;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified?: boolean | null;
  getIdToken?(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult?(forceRefresh?: boolean): Promise<AuthUserTokenResult>;
}

export interface AuthProvider {
  readonly currentUser: AuthUser | null;
  readonly authState$: Observable<AuthUser | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: AuthUser }>;
  updateProfile(user: AuthUser, profile: { displayName?: string }): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  updatePassword(user: AuthUser, newPassword: string, currentPassword?: string): Promise<void>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
}
