import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/auth.model';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth-service';

export const roleGuard = (...alowedRoles:AppRole[]): CanActivateFn => (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

      // no logueado
    if (!authService.isLoggedIn()) {
      alert('Debes iniciar sesión para acceder a esta página.');
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // logueado pero sin rol adecuado
    if (!authService.hasRole(...alowedRoles)) {
      alert('No tienes permisos para acceder a esta página.');
      return router.createUrlTree(['/hall']);
    }


    //tofdo bien
  return true;
};
