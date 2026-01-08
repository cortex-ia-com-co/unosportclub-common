import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should add a success toast', () => {
      service.success('Test success message');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);
      expect(toasts()[0].type).toBe('success');
      expect(toasts()[0].message).toBe('Test success message');
      expect(toasts()[0].id).toBeTruthy();
    });
  });

  describe('error', () => {
    it('should add an error toast', () => {
      service.error('Test error message');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);
      expect(toasts()[0].type).toBe('error');
      expect(toasts()[0].message).toBe('Test error message');
    });
  });

  describe('warning', () => {
    it('should add a warning toast', () => {
      service.warning('Test warning message');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);
      expect(toasts()[0].type).toBe('warning');
      expect(toasts()[0].message).toBe('Test warning message');
    });
  });

  describe('info', () => {
    it('should add an info toast', () => {
      service.info('Test info message');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);
      expect(toasts()[0].type).toBe('info');
      expect(toasts()[0].message).toBe('Test info message');
    });
  });

  describe('dismiss', () => {
    it('should remove a toast by id', () => {
      service.success('Message 1');
      service.error('Message 2');
      const toasts = service.getToasts();
      const firstId = toasts()[0].id;

      expect(toasts().length).toBe(2);

      service.dismiss(firstId);

      expect(toasts().length).toBe(1);
      expect(toasts()[0].message).toBe('Message 2');
    });

    it('should not remove anything if id does not exist', () => {
      service.success('Message 1');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);

      service.dismiss('non-existent-id');

      expect(toasts().length).toBe(1);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple toasts', () => {
      service.success('Success 1');
      service.error('Error 1');
      service.warning('Warning 1');
      service.info('Info 1');

      const toasts = service.getToasts();
      expect(toasts().length).toBe(4);
      expect(toasts()[0].type).toBe('success');
      expect(toasts()[1].type).toBe('error');
      expect(toasts()[2].type).toBe('warning');
      expect(toasts()[3].type).toBe('info');
    });
  });

  describe('auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-dismiss toast after 5 seconds', () => {
      service.success('Auto-dismiss test');
      const toasts = service.getToasts();
      expect(toasts().length).toBe(1);

      vi.advanceTimersByTime(5000);

      expect(toasts().length).toBe(0);
    });

    it('should dismiss all toasts after their timeout', () => {
      service.success('Message 1');
      service.error('Message 2');
      const toasts = service.getToasts();

      expect(toasts().length).toBe(2);

      vi.advanceTimersByTime(5000);

      expect(toasts().length).toBe(0);
    });
  });

  describe('getToasts', () => {
    it('should return readonly signal', () => {
      service.success('Test');
      const toasts = service.getToasts();
      const initialLength = toasts().length;

      expect(initialLength).toBe(1);
      expect(toasts().length).toBe(1);
    });
  });
});
