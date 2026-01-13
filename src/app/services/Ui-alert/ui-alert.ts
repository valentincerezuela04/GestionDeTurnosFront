import { Injectable, signal } from '@angular/core';

export type AlertTone = 'solid' | 'soft' | 'outline';
export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface UiAlertState {
  open: boolean;
  tone: AlertTone;
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  timeoutMs?: number;
}

@Injectable({ providedIn: 'root' })
export class UiAlertService {
  private readonly _state = signal<UiAlertState | null>(null);
  readonly state = this._state.asReadonly();

  show(input: Omit<UiAlertState, 'open'>) {
    const data: UiAlertState = {
      open: true,
      dismissible: true,
      ...input,
    };

    this._state.set(data);

    if (data.timeoutMs && data.timeoutMs > 0) {
      window.setTimeout(() => {
        const cur = this._state();
        if (cur?.open) this.clear();
      }, data.timeoutMs);
    }
  }

  clear() {
    this._state.set(null);
  }
}
