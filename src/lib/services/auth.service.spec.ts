import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { AuthService, AuthClientInterface, Permissions } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockAuth: Partial<Auth>;
  let mockUser: User;

  function createMockUser(claims: Record<string, boolean> = {}): User {
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
      }),
    } as unknown as User;
  }

  function createAuthMock(currentUser: User | null): Partial<Auth> {
    const mockApp = {
      name: 'test-app',
      options: {},
      automaticDataCollectionEnabled: false,
    };
    
    return {
      currentUser,
      app: mockApp as any,
      onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
        callback(currentUser);
        return () => {};
      }),
    };
  }

  beforeEach(() => {
    mockUser = createMockUser();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        AuthService,
        { provide: Auth, useValue: createAuthMock(mockUser) },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should detect operator role', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isOperator).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for operator', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should detect admin role', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isAdmin).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for admin', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      await new Promise(resolve => setTimeout(resolve, 200));
      const isAdmin = await firstValueFrom(service.isAdmin());
      expect(isAdmin).toBe(true);
    });
  });

  describe('Permissions - Sudo Role', () => {
    beforeEach(() => {
      mockUser = createMockUser({ sudo: true });
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should detect sudo role', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isSudo).toBe(true);
      expect(permissions.hasPanelAccess).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
    });

    it('should return correct permissions for sudo', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should detect trainer role', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const permissions = service.checkPermissions();
      expect(permissions.isTrainer).toBe(true);
      expect(permissions.hasAnyRole).toBe(true);
      expect(permissions.hasPanelAccess).toBe(false);
    });

    it('should return correct permissions for trainer', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      await new Promise(resolve => setTimeout(resolve, 200));
      const isTrainer = await firstValueFrom(service.isTrainer());
      expect(isTrainer).toBe(true);
    });
  });

  describe('Permissions - Multiple Roles', () => {
    beforeEach(() => {
      mockUser = createMockUser({ operator: true, admin: true });
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should detect multiple roles', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
    });

    it('should return default permissions when no role', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      const authMock = createAuthMock(null);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
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
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return true for admin', async () => {
      mockUser = createMockUser({ admin: true });
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return true for sudo', async () => {
      mockUser = createMockUser({ sudo: true });
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(true);
    });

    it('should return false for trainer', async () => {
      mockUser = createMockUser({ trainer: true });
      const authMock = createAuthMock(mockUser);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
      service.initialize({
        apiUrl: '/api',
        enablePermissions: true,
      });
      await new Promise(resolve => setTimeout(resolve, 200));
      const hasAccess = await firstValueFrom(service.hasPanelAccess());
      expect(hasAccess).toBe(false);
    });
  });

  describe('currentUser', () => {
    it('should return current user', () => {
      expect(service.currentUser).toBe(mockUser);
    });

    it('should return null when no user', () => {
      const authMock = createAuthMock(null);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Auth, useValue: authMock },
        ],
      });
      service = TestBed.inject(AuthService);
      expect(service.currentUser).toBeNull();
    });
  });
});
