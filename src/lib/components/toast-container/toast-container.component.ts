import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'ust-toast-container',
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      @for (toast of toasts(); track toast.id) {
        <div
          [class]="getToastClasses(toast.type)"
          class="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in slide-in-from-right fade-in"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="dismiss(toast.id)" class="text-white/80 hover:text-white">×</button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  toasts = this.toastService.getToasts();

  constructor() {
    effect(() => {
      this.toasts();
      this.cdr.markForCheck();
    });
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getToastClasses(type: ToastType): string {
    const base = 'text-white';
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
    };
    return `${base} ${colors[type]}`;
  }
}
