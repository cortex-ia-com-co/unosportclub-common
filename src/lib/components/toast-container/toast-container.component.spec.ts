import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../../services/toast.service';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toasts from service', () => {
    toastService.success('Test message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toastElement = compiled.querySelector('.bg-green-500');
    expect(toastElement).toBeTruthy();
    expect(toastElement?.textContent).toContain('Test message');
  });

  it('should render multiple toasts', () => {
    toastService.success('Message 1');
    toastService.error('Message 2');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toasts = compiled.querySelectorAll('[class*="bg-"]');
    expect(toasts.length).toBe(2);
  });

  it('should call dismiss when close button is clicked', () => {
    toastService.success('Test message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dismissButton = compiled.querySelector('button');
    expect(dismissButton).toBeTruthy();

    const dismissSpy = vi.spyOn(toastService, 'dismiss');
    dismissButton?.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(dismissSpy).toHaveBeenCalled();
  });

  describe('getToastClasses', () => {
    it('should return correct classes for success', () => {
      const classes = component.getToastClasses('success');
      expect(classes).toContain('text-white');
      expect(classes).toContain('bg-green-500');
    });

    it('should return correct classes for error', () => {
      const classes = component.getToastClasses('error');
      expect(classes).toContain('text-white');
      expect(classes).toContain('bg-red-500');
    });

    it('should return correct classes for warning', () => {
      const classes = component.getToastClasses('warning');
      expect(classes).toContain('text-white');
      expect(classes).toContain('bg-yellow-500');
    });

    it('should return correct classes for info', () => {
      const classes = component.getToastClasses('info');
      expect(classes).toContain('text-white');
      expect(classes).toContain('bg-blue-500');
    });
  });

  it('should update when toasts change', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[class*="bg-"]')).toBeFalsy();

    toastService.success('New message');
    fixture.detectChanges();

    expect(compiled.querySelector('[class*="bg-"]')).toBeTruthy();
  });

  it('should have correct container positioning classes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container?.className).toContain('fixed');
    expect(container?.className).toContain('bottom-4');
    expect(container?.className).toContain('right-4');
    expect(container?.className).toContain('z-50');
  });
});
