import { Injectable, inject, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, BehaviorSubject, from, Subject } from 'rxjs';
import { takeUntil, switchMap, filter, take } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

export interface RelayServiceConfig {
  relayUrl: string;
  apiUrl: string;
}

export interface JoinRoomResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RelayService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private config: RelayServiceConfig | null = null;
  private socket: Socket | null = null;
  private readonly readySubject = new BehaviorSubject<boolean>(false);
  private readonly systemEventsSubject = new Subject<unknown>();
  private readonly destroy$ = new Subject<void>();

  readonly ready$ = this.readySubject.asObservable();
  readonly systemEvents$ = this.systemEventsSubject.asObservable();

  initialize(authService: AuthService, config: RelayServiceConfig): void {
    this.config = config;
    this.connect(authService);
  }

  private connect(authService: AuthService): void {
    if (!this.config) {
      return;
    }

    authService.authState$
      .pipe(
        switchMap((user) => {
          if (!user) {
            this.disconnect();
            return from(Promise.resolve(null));
          }
          return from(user.getIdToken());
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((token) => {
        if (token && this.config) {
          this.connectSocket(token);
        } else {
          this.disconnect();
        }
      });
  }

  private connectSocket(token: string): void {
    if (!this.config) {
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.disconnect();

    const relayUrl = this.config.relayUrl.endsWith('/realtime')
      ? this.config.relayUrl
      : `${this.config.relayUrl}/realtime`;

    this.socket = io(relayUrl, {
      auth: {
        token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      // Solo cuando el socket está conectado, escuchamos el evento 'connected' del servidor
      this.socket?.once('connected', (data: { socketId: string; userId: string | null }) => {
        if (this.socket?.connected) {
          this.readySubject.next(true);
        }
      });
    });

    this.socket.on('disconnect', () => {
      this.readySubject.next(false);
    });

    this.socket.on('system', (data: unknown) => {
      this.systemEventsSubject.next(data);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[RelayService] ❌ Connection error:', error.message || error);
      this.readySubject.next(false);
    });
  }

  private disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.readySubject.next(false);
    }
  }

  joinRoom(room: string, callback: (response: JoinRoomResponse) => void): void {
    if (!this.socket) {
      callback({ success: false, message: 'Socket not initialized' });
      return;
    }

    if (this.readySubject.value && this.socket.connected) {
      this.emitJoinRoom(room, callback);
      return;
    }

    this.ready$
      .pipe(
        filter((ready) => ready === true),
        take(1),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          if (this.socket?.connected) {
            this.emitJoinRoom(room, callback);
          } else {
            callback({
              success: false,
              message: 'Socket disconnected while waiting for authentication',
            });
          }
        },
      });
  }

  private emitJoinRoom(room: string, callback: (response: JoinRoomResponse) => void): void {
    if (!this.socket?.connected) {
      callback({ success: false, message: 'Socket not connected' });
      return;
    }

    this.socket.emit('unirse', { room }, (response: JoinRoomResponse | Error) => {
      if (response instanceof Error) {
        callback({ success: false, message: response.message || 'Unknown error' });
        return;
      }
      if (!response || !response.success) {
        callback({
          success: false,
          message: (response as JoinRoomResponse)?.message || 'Failed to join room',
        });
        return;
      }
      callback(response as JoinRoomResponse);
    });
  }

  identify(userId: string, callback?: (response: { success: boolean }) => void): void {
    if (!this.socket?.connected) {
      callback?.({ success: false });
      return;
    }

    this.socket.emit('identificar', { userId }, (response: { success: boolean }) => {
      callback?.(response);
    });
  }

  notify(data: unknown, destino: 'yo' | 'ustedes' | 'nosotros' | 'room', room?: string): void {
    if (!this.socket?.connected) {
      return;
    }

    const payload: { data: unknown; destino: string; room?: string } = {
      data,
      destino,
    };

    if (destino === 'room' && room) {
      payload.room = room;
    }

    this.socket.emit('notificar', payload);
  }

  sendMessage(data: unknown, destino: 'yo' | 'ustedes' | 'nosotros' | 'room', room?: string): void {
    if (!this.socket?.connected) {
      return;
    }

    const payload: { data: unknown; destino: string; room?: string } = {
      data,
      destino,
    };

    if (destino === 'room' && room) {
      payload.room = room;
    }

    this.socket.emit('relay', payload);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
