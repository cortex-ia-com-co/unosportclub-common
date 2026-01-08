import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService, AuthClientInterface, Permissions } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockUser: User;

  function createMockUser(claims: Record<string, boolean> = {}): User {
    return {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdToken: jasmine.createSpy('getIdToken').and.returnValue(Promise.resolve('token123')),
      getIdTokenResult: jasmine.createSpy('getIdTokenResult').and.returnValue(
        Promise.resolve({
          claims,
          token: 'token123',
          expirationTime: '1234567890',
          issuedAtTime: '1234567890',
          signInProvider: 'password',
          signInSecondFactor: null,
        }),
      ),
    } as unknown as User;
  }

  function createAuthMock(currentUser: User | null): jasmine.SpyObj<Auth> {
    const mockApp = {
      name: 'test-app',
      options: {},
      automaticDataCollectionEnabled: false,
    };
    
    const auth = jasmine.createSpyObj('Auth', [], {
      currentUser,
      app: mockApp,
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged').and.callFake((callback: (user: User | null) => void) => {
        callback(currentUser);
        return () => {};
      }),
    });
    
    return auth;
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

    it('should detect operator role', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions.isOperator).toBe(true);
        expect(permissions.hasPanelAccess).toBe(true);
        expect(permissions.hasAnyRole).toBe(true);
        done();
      }, 200);
    });

    it('should return correct permissions for operator', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions).toEqual({
          isOperator: true,
          isAdmin: false,
          isSudo: false,
          isTrainer: false,
          hasAnyRole: true,
          hasPanelAccess: true,
        });
        done();
      }, 200);
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

    it('should detect admin role', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions.isAdmin).toBe(true);
        expect(permissions.hasPanelAccess).toBe(true);
        expect(permissions.hasAnyRole).toBe(true);
        done();
      }, 200);
    });

    it('should return correct permissions for admin', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions).toEqual({
          isOperator: false,
          isAdmin: true,
          isSudo: false,
          isTrainer: false,
          hasAnyRole: true,
          hasPanelAccess: true,
        });
        done();
      }, 200);
    });

    it('should return true for isAdmin observable', (done) => {
      setTimeout(() => {
        firstValueFrom(service.isAdmin()).then((isAdmin) => {
          expect(isAdmin).toBe(true);
          done();
        });
      }, 200);
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

    it('should detect sudo role', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions.isSudo).toBe(true);
        expect(permissions.hasPanelAccess).toBe(true);
        expect(permissions.hasAnyRole).toBe(true);
        done();
      }, 200);
    });

    it('should return correct permissions for sudo', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions).toEqual({
          isOperator: false,
          isAdmin: false,
          isSudo: true,
          isTrainer: false,
          hasAnyRole: true,
          hasPanelAccess: true,
        });
        done();
      }, 200);
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

    it('should detect trainer role', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions.isTrainer).toBe(true);
        expect(permissions.hasAnyRole).toBe(true);
        expect(permissions.hasPanelAccess).toBe(false);
        done();
      }, 200);
    });

    it('should return correct permissions for trainer', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions).toEqual({
          isOperator: false,
          isAdmin: false,
          isSudo: false,
          isTrainer: true,
          hasAnyRole: true,
          hasPanelAccess: false,
        });
        done();
      }, 200);
    });

    it('should return true for isTrainer observable', (done) => {
      setTimeout(() => {
        firstValueFrom(service.isTrainer()).then((isTrainer) => {
          expect(isTrainer).toBe(true);
          done();
        });
      }, 200);
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

    it('should detect multiple roles', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions.isOperator).toBe(true);
        expect(permissions.isAdmin).toBe(true);
        expect(permissions.hasAnyRole).toBe(true);
        expect(permissions.hasPanelAccess).toBe(true);
        done();
      }, 200);
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

    it('should return default permissions when no role', (done) => {
      setTimeout(() => {
        const permissions = service.checkPermissions();
        expect(permissions).toEqual({
          isOperator: false,
          isAdmin: false,
          isSudo: false,
          isTrainer: false,
          hasAnyRole: false,
          hasPanelAccess: false,
        });
        done();
      }, 200);
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
    it('should return true for operator', (done) => {
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
      setTimeout(() => {
        firstValueFrom(service.hasPanelAccess()).then((hasAccess) => {
          expect(hasAccess).toBe(true);
          done();
        });
      }, 200);
    });

    it('should return true for admin', (done) => {
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
      setTimeout(() => {
        firstValueFrom(service.hasPanelAccess()).then((hasAccess) => {
          expect(hasAccess).toBe(true);
          done();
        });
      }, 200);
    });

    it('should return true for sudo', (done) => {
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
      setTimeout(() => {
        firstValueFrom(service.hasPanelAccess()).then((hasAccess) => {
          expect(hasAccess).toBe(true);
          done();
        });
      }, 200);
    });

    it('should return false for trainer', (done) => {
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
      setTimeout(() => {
        firstValueFrom(service.hasPanelAccess()).then((hasAccess) => {
          expect(hasAccess).toBe(false);
          done();
        });
      }, 200);
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
