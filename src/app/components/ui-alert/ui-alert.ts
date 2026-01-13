import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { UiAlertService } from '../../services/Ui-alert/ui-alert';


@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed right-4 top-4 z-[9999] w-[min(92vw,520px)]" *ngIf="state() as a">
      <div
        class="alert flex items-center gap-4"
        [ngClass]="alertClasses()"
        role="alert"
      >
        <!-- icon -->
        <span [class]="iconClass()" class="shrink-0 size-6" aria-hidden="true"></span>

        <!-- text -->
        <p class="min-w-0">
          <span class="text-lg font-semibold">
            {{ a.title || defaultTitle() }}:
          </span>
          <span class="break-words"> {{ a.message }} </span>
        </p>

        <!-- close -->
        <button
          *ngIf="a.dismissible !== false"
          type="button"
          class="ml-auto inline-flex size-9 items-center justify-center rounded-xl
                 border border-[var(--border)] bg-[var(--bg-2)] text-[var(--text)]
                 transition hover:opacity-90 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-[var(--accent-glow)]"
          (click)="close()"
          aria-label="Cerrar alerta"
        >
          <span class="icon-[tabler--x] size-5"></span>
        </button>
      </div>
    </div>
  `,
})
export class UiAlertComponent {
  private readonly ui = inject(UiAlertService);
  state = this.ui.state;

  close() {
    this.ui.clear();
  }

  alertClasses = computed(() => {
    const a = this.state();
    if (!a) return [];

    const toneClass =
      a.tone === 'soft' ? 'alert-soft' : a.tone === 'outline' ? 'alert-outline' : '';

    const variantClass =
      a.variant === 'success'
        ? 'alert-success'
        : a.variant === 'warning'
        ? 'alert-warning'
        : a.variant === 'error'
        ? 'alert-error'
        : 'alert-info';

    return [toneClass, variantClass].filter(Boolean);
  });

  defaultTitle = computed(() => {
    const a = this.state();
    switch (a?.variant) {
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
    const a = this.state();
    switch (a?.variant) {
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
}
