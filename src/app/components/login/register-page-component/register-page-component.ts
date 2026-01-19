import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/Auth/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UiAlertService } from '../../../services/Ui-alert/ui-alert';

@Component({
  selector: 'app-register-page-component',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page-component.html',
  styleUrl: './register-page-component.css',
})
export class RegisterPageComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private uiAlert = inject(UiAlertService);


  showPassword = false
  loading = false;
  error = '';

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[\p{L}\s]+$/u)]],
    apellido: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[\p{L}\s]+$/u)]],
    dni: ['', [Validators.required, Validators.maxLength(8), Validators.pattern(/^[0-9]{7,8}$/)]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    contrasena: [
      '',
      [Validators.required, Validators.minLength(4), Validators.pattern(/^(?=.*\d).{4,}$/)],
    ],
  });

  private readonly lettersOnly = /[^\p{L}\s]/gu;
  private readonly digitsOnly = /\D+/g;

  onLettersInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const sanitized = input.value.replace(this.lettersOnly, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.get(controlName)?.setValue(sanitized);
    }
  }

  onNumbersInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const sanitized = input.value.replace(this.digitsOnly, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.form.get(controlName)?.setValue(sanitized);
    }
  }

    get returnUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('returnUrl');
  }


  onSubmit() {
if (this.form.invalid) {
  this.form.markAllAsTouched();
  this.uiAlert.show({
    variant: 'warning',
    tone: 'soft',
    title: 'Warning alert',
    message: 'Revisa los campos marcados: hay datos invalidos.',
    timeoutMs: 4500,
  });
  return;
}


    this.loading = true;
    this.error = '';

    this.auth.register(this.form.getRawValue()).subscribe({
 next: () => {
  this.loading = false;
  this.uiAlert.show({
    variant: 'success',
    tone: 'soft',
    title: 'Success alert',
    message: 'Te registraste correctamente. Por favor, inicia sesion.',
    timeoutMs: 3500,
  });
  this.router.navigate(['/login']);
},

    error: (err: unknown) => {
  this.loading = false;
  console.error('Registration failed', err as any);

  this.error = (err as any)?.error ?? 'No se pudo registrar';

  this.uiAlert.show({
    variant: 'error',
    tone: 'soft',
    title: 'Error',
    message: this.error,
    timeoutMs: 6000,
  });
},

    });
  }







  submitted = false;

private interacted(name: string): boolean {
  const c = this.form.get(name);
  return !!c && (this.submitted || c.touched || c.dirty);
}

isInvalid(name: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && c.invalid;
}

isValid(name: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && c.valid;
}

hasError(name: string, key: string): boolean {
  const c = this.form.get(name);
  return !!c && this.interacted(name) && !!c.errors?.[key];
}
}

