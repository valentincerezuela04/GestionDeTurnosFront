import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/Auth/auth-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page-component',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page-component.html',
  styleUrl: './login-page-component.css',
})
export class LoginPageComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  error = '';
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  get returnUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('returnUrl');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/hall';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
                if (err.status === 400) {
          // acá asumimos que 400 = email/contraseña incorrectos
          this.error = 'Email o contraseña incorrectos.';
        } else if (err.status === 0) {
          // error de red / backend caído
          this.error = 'No se pudo conectar con el servidor. Intentalo más tarde.';
        } else {
          this.error = 'Ocurrió un error al iniciar sesión. Intentalo de nuevo.';
        }

        // this.error = err?.error ?? 'No se pudo iniciar sesi�n';
        console.error('Login failed', err);
      },
    });
  }

  hasError(controlName: string, error: string) {
    const ctrl = this.form.get(controlName);
    return ctrl?.touched && ctrl.hasError(error);
  }
}

