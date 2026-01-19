import { Injectable, signal } from '@angular/core';
import type { AlertTone, AlertVariant } from '../Ui-alert/ui-alert';

export interface UiConfirmState {
  open: boolean;
  tone: AlertTone;
  variant: AlertVariant;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class UiConfirmService {
  private readonly _state = signal<UiConfirmState | null>(null);
  readonly state = this._state.asReadonly();
  private resolver: ((value: boolean) => void) | null = null;

  open(input: Omit<UiConfirmState, 'open'>): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = null;
    }

    return new Promise((resolve) => {
      this.resolver = resolve;
      this._state.set({ open: true, ...input });
    });
  }

  confirm(): void {
    this.finish(true);
  }

  cancel(): void {
    this.finish(false);
  }

  private finish(value: boolean): void {
    if (this.resolver) {
      this.resolver(value);
      this.resolver = null;
    }
    this._state.set(null);
  }
}
