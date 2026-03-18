import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import type { AuthUser, AuthUserTokenResult } from './auth-provider.interface';
import { AuthService } from './auth.service';

function createMockUser(claims: Record<string, unknown> = {}): AuthUser {
  return {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: vi.fn().mockResolvedValue('token123'),
    getIdTokenResult: vi.fn().mockResolvedValue({
      claims,
      token: 'token123',
      expirationTime: '1234567890',
      issuedAtTime: '1234567890',
      signInProvider: 'password',
      signInSecondFactor: null,
    } as AuthUserTokenResult),
  };
}

function createMockAuthProvider(currentUser: AuthUser | null): {
  currentUser: AuthUser | null;
  authState$: BehaviorSubject<AuthUser | null>;
  signIn: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  createUserWithEmailAndPassword: ReturnType<typeof vi.fn>;
  updateProfile: ReturnType<typeof vi.fn>;
  sendPasswordResetEmail: ReturnType<typeof vi.fn>;
  updatePassword: ReturnType<typeof vi.fn>;
  confirmPasswordReset: ReturnType<typeof vi.fn>;
} {
  const authState$ = new BehaviorSubject<AuthUser | null>(currentUser);
  return {
    currentUser,
    authState$,
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ user: currentUser }),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    confirmPasswordReset: vi.fn().mockResolvedValue(undefined),
  };
}

const mockHttp = {
  post: vi.fn().mockReturnValue({ pipe: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
  get: vi.fn().mockReturnValue({ pipe: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
} as unknown as import('@angular/common/http').HttpClient;

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthProvider: ReturnType<typeof createMockAuthProvider>;
  let mockUser: AuthUser;

  function setupServiceWithClaims(claims: Record<string, unknown>): void {
    mockUser = createMockUser(claims);
    mockAuthProvider = createMockAuthProvider(mockUser);
    mockAuthProvider.authState$.next(mockUser);
    service = new AuthService(mockAuthProvider, mockHttp);
    service.initialize({ apiUrl: '/api', enablePermissions: true });
  }

  async function waitForPermissions(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  beforeEach(() => {
    mockUser = createMockUser();
    mockAuthProvider = createMockAuthProvider(mockUser);
    mockAuthProvider.authState$.next(mockUser);
    service = new AuthService(mockAuthProvider, mockHttp);
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with config', () => {
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
        enableClientRegistration: true,
      });
      expect(service).toBeTruthy();
    });
  });

  describe('Permissions - Operator Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({ operator: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should detect operator role', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isOperator).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for operator', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: true,
        isAdmin: false,
        isSudo: false,
        isTrainer: false,
        hasAnyRole: true,
        hasPanelAccess: true,
      });
    });
  });

  describe('Permissions - Admin Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({ admin: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should detect admin role', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isAdmin).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for admin', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: false,
        isAdmin: true,
        isSudo: false,
        isTrainer: false,
        hasAnyRole: true,
        hasPanelAccess: true,
      });
    });

    it('should return true for isAdmin observable', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const isAdmin = await firstValueFrom(service.isAdmin());
      expect(isAdmin).toBe(true);
    });
  });

  describe('Permissions - Sudo Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({ sudo: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should detect sudo role', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isSudo).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for sudo', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: false,
        isAdmin: false,
        isSudo: true,
        isTrainer: false,
        hasAnyRole: true,
        hasPanelAccess: true,
      });
    });
  });

  describe('Permissions - Trainer Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({ trainer: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should detect trainer role', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isTrainer).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
      expect(permissions.hasPanelAccess).toBe(false);
    });

    it('should return correct permissions for trainer', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: false,
        isAdmin: false,
        isSudo: false,
        isTrainer: true,
        hasAnyRole: true,
        hasPanelAccess: false,
      });
    });

    it('should return true for isTrainer observable', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const isTrainer = await firstValueFrom(service.isTrainer());
      expect(isTrainer).toBe(true);
    });
  });

  describe('roleFromClaims via customAttributes - Operator', () => {
    beforeEach(() => {
      setupServiceWithClaims({ customAttributes: '{"operator":true,"admin":false,"sudo":false,"trainer":false}' });
    });

    it('should set isOperator from customAttributes JSON string', async () => {
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(true);
      expect(p.isAdmin).toBe(false);
      expect(p.isSudo).toBe(false);
      expect(p.isTrainer).toBe(false);
      expect(p.hasPanelAccess).toBe(true);
      expect(p.hasAnyRole).toBe(true);
    });
  });

  describe('roleFromClaims via customAttributes - Admin', () => {
    beforeEach(() => {
      setupServiceWithClaims({ customAttributes: '{"operator":false,"admin":true,"sudo":false,"trainer":false}' });
    });

    it('should set isAdmin from customAttributes JSON string', async () => {
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(false);
      expect(p.isAdmin).toBe(true);
      expect(p.isSudo).toBe(false);
      expect(p.isTrainer).toBe(false);
      expect(p.hasPanelAccess).toBe(true);
      expect(p.hasAnyRole).toBe(true);
    });

    it('should return true for isAdmin() when only customAttributes has admin', async () => {
      await waitForPermissions();
      const isAdmin = await firstValueFrom(service.isAdmin());
      expect(isAdmin).toBe(true);
    });
  });

  describe('roleFromClaims via customAttributes - Sudo', () => {
    beforeEach(() => {
      setupServiceWithClaims({ customAttributes: '{"operator":false,"admin":false,"sudo":true,"trainer":false}' });
    });

    it('should set isSudo from customAttributes JSON string', async () => {
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(false);
      expect(p.isAdmin).toBe(false);
      expect(p.isSudo).toBe(true);
      expect(p.isTrainer).toBe(false);
      expect(p.hasPanelAccess).toBe(true);
      expect(p.hasAnyRole).toBe(true);
    });
  });

  describe('roleFromClaims via customAttributes - Trainer', () => {
    beforeEach(() => {
      setupServiceWithClaims({ customAttributes: '{"trainer":true,"operator":false,"admin":false,"sudo":false}' });
    });

    it('should set isTrainer from customAttributes JSON string', async () => {
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(false);
      expect(p.isAdmin).toBe(false);
      expect(p.isSudo).toBe(false);
      expect(p.isTrainer).toBe(true);
      expect(p.hasPanelAccess).toBe(false);
      expect(p.hasAnyRole).toBe(true);
    });

    it('should return true for isTrainer() when only customAttributes has trainer', async () => {
      await waitForPermissions();
      const isTrainer = await firstValueFrom(service.isTrainer());
      expect(isTrainer).toBe(true);
    });
  });

  describe('roleFromClaims edge cases', () => {
    it('should read roles from customAttributes when it is an object (not string)', async () => {
      setupServiceWithClaims({
        customAttributes: { trainer: true, operator: false, admin: false, sudo: false },
      });
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isTrainer).toBe(true);
      expect(p.isOperator).toBe(false);
      expect(p.hasAnyRole).toBe(true);
    });

    it('should treat all roles false when customAttributes is invalid JSON', async () => {
      setupServiceWithClaims({ customAttributes: 'not valid json {' });
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(false);
      expect(p.isAdmin).toBe(false);
      expect(p.isSudo).toBe(false);
      expect(p.isTrainer).toBe(false);
      expect(p.hasAnyRole).toBe(false);
      expect(p.hasPanelAccess).toBe(false);
    });

    it('should prefer direct claim over customAttributes when both present', async () => {
      setupServiceWithClaims({
        trainer: true,
        customAttributes: '{"trainer":false,"operator":false,"admin":false,"sudo":false}',
      });
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isTrainer).toBe(true);
    });

    it('should resolve multiple roles from customAttributes', async () => {
      setupServiceWithClaims({
        customAttributes: '{"operator":true,"admin":true,"sudo":false,"trainer":true}',
      });
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(true);
      expect(p.isAdmin).toBe(true);
      expect(p.isTrainer).toBe(true);
      expect(p.isSudo).toBe(false);
      expect(p.hasPanelAccess).toBe(true);
      expect(p.hasAnyRole).toBe(true);
    });

    it('should treat missing customAttributes as no role', async () => {
      setupServiceWithClaims({});
      await waitForPermissions();
      const p = service.checkPermissions();
      expect(p.isOperator).toBe(false);
      expect(p.isAdmin).toBe(false);
      expect(p.isSudo).toBe(false);
      expect(p.isTrainer).toBe(false);
    });
  });

  describe('Permissions - Multiple Roles', () => {
    beforeEach(() => {
      mockUser = createMockUser({ operator: true, admin: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should detect multiple roles', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isOperator).toBe(true);
      expect(permissions.isAdmin).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
    });
  });

  describe('Permissions - No Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({});
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should return default permissions when no role', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: false,
        isAdmin: false,
        isSudo: false,
        isTrainer: false,
        hasAnyRole: false,
        hasPanelAccess: false,
      });
    });
  });

  describe('Permissions - No User', () => {
    beforeEach(() => {
      mockAuthProvider = createMockAuthProvider(null);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
    });

    it('should return default permissions when no user', () => {
      const permissions = service.checkPermissions();
      expect(permissions).toEqual({
        isOperator: false,
        isAdmin: false,
        isSudo: false,
        isTrainer: false,
        hasAnyRole: false,
        hasPanelAccess: false,
      });
    });
  });

  describe('hasPanelAccess', () => {
    it('should return true for operator', async () => {
      mockUser = createMockUser({ operator: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return true for admin', async () => {
      mockUser = createMockUser({ admin: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return true for sudo', async () => {
      mockUser = createMockUser({ sudo: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return false for trainer', async () => {
      mockUser = createMockUser({ trainer: true });
      mockAuthProvider = createMockAuthProvider(mockUser);
      mockAuthProvider.authState$.next(mockUser);
      service = new AuthService(mockAuthProvider, mockHttp);
      service.initialize({ apiUrl: '/api', enablePermissions: true });
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(false);
    });
  });

  describe('currentUser', () => {
    it('should return current user', () => {
      expect(service.currentUser).toBe(mockUser);
    });

    it('should return null when no user', () => {
      mockAuthProvider = createMockAuthProvider(null);
      service = new AuthService(mockAuthProvider, mockHttp);
      expect(service.currentUser).toBeNull();
    });
  });
});
