import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/Auth/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page-component',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page-component.html',
  styleUrl: './login-page-component.css',
})
export class LoginPageComponent {
    private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  form = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
  });

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
        alert('Has iniciado sesión correctamente.');
        this.router.navigate(['/hall']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error ?? 'No se pudo iniciar sesión';
        console.error('Login failed', err);
      },
    });
  }

  hasError(controlName: string, error: string) {
    const ctrl = this.form.get(controlName);
    return ctrl?.touched && ctrl.hasError(error);
  }
}
