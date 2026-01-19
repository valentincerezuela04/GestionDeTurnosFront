import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject } from '@angular/core';
import { UiConfirmService } from '../../services/Ui-confirm/ui-confirm';

@Component({
  selector: 'ui-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4" *ngIf="state() as c">
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        (click)="cancel()"
        aria-hidden="true"
      ></div>

      <div class="relative w-full max-w-[520px]" role="dialog" aria-modal="true">
        <div class="alert flex items-start gap-4 shadow-[var(--shadow)]" [ngClass]="alertClasses()">
          <span [class]="iconClass()" class="shrink-0 size-6" aria-hidden="true"></span>

          <div class="min-w-0 flex-1">
            <p class="text-lg font-semibold">
              {{ c.title || defaultTitle() }}
            </p>
            <p class="mt-1 text-sm leading-relaxed">{{ c.message }}</p>

            <div class="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-[var(--border)]
                       bg-[var(--bg-2)] px-4 py-2 text-sm font-semibold text-[var(--text)]
                       transition hover:opacity-90 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-[var(--accent-glow)]"
                (click)="cancel()"
              >
                {{ c.cancelText || 'Cancelar' }}
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border bg-[var(--card)]
                       px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2"
                [ngClass]="confirmButtonClasses()"
                (click)="confirm()"
              >
                {{ c.confirmText || 'Confirmar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UiConfirmComponent {
  private readonly ui = inject(UiConfirmService);
  state = this.ui.state;

  confirm(): void {
    this.ui.confirm();
  }

  cancel(): void {
    this.ui.cancel();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.state()) this.cancel();
  }

  alertClasses = computed(() => {
    const c = this.state();
    if (!c) return [];

    const toneClass = c.tone === 'soft' ? 'alert-soft' : c.tone === 'outline' ? 'alert-outline' : '';

    const variantClass =
      c.variant === 'success'
        ? 'alert-success'
        : c.variant === 'warning'
          ? 'alert-warning'
          : c.variant === 'error'
            ? 'alert-error'
            : 'alert-info';

    return [toneClass, variantClass].filter(Boolean);
  });

  defaultTitle = computed(() => {
    const c = this.state();
    switch (c?.variant) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Info';
    }
  });

  iconClass = computed(() => {
    const c = this.state();
    switch (c?.variant) {
      case 'success':
        return 'icon-[tabler--circle-check]';
      case 'warning':
        return 'icon-[tabler--alert-triangle]';
      case 'error':
        return 'icon-[tabler--circle-x]';
      default:
        return 'icon-[tabler--info-circle]';
    }
  });

  confirmButtonClasses = computed(() => {
    const c = this.state();
    if (!c) return [];

    switch (c.variant) {
      case 'success':
        return [
          'border-[color:rgba(15,185,129,0.45)]',
          'text-[color:var(--success)]',
          'hover:bg-[color:rgba(15,185,129,0.12)]',
          'hover:border-[color:rgba(15,185,129,0.65)]',
          'focus-visible:ring-[color:rgba(15,185,129,0.35)]',
        ];
      case 'warning':
        return [
          'border-[color:rgba(182,122,0,0.45)]',
          'text-[color:var(--warning)]',
          'hover:bg-[color:rgba(182,122,0,0.12)]',
          'hover:border-[color:rgba(182,122,0,0.65)]',
          'focus-visible:ring-[color:rgba(182,122,0,0.35)]',
        ];
      case 'error':
        return [
          'border-[color:rgba(225,29,72,0.45)]',
          'text-[color:var(--danger)]',
          'hover:bg-[color:rgba(225,29,72,0.12)]',
          'hover:border-[color:rgba(225,29,72,0.65)]',
          'focus-visible:ring-[color:rgba(225,29,72,0.35)]',
        ];
      default:
        return [
          'border-[color:rgba(124,92,255,0.45)]',
          'text-[color:var(--accent-500)]',
          'hover:bg-[color:rgba(124,92,255,0.12)]',
          'hover:border-[color:rgba(124,92,255,0.65)]',
          'focus-visible:ring-[color:rgba(124,92,255,0.35)]',
        ];
    }
  });
}
