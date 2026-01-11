import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/auth.model';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth-service';
import { UiAlertService } from '../services/Ui-alert/ui-alert';

export const roleGuard = (...alowedRoles: AppRole[]): CanActivateFn => (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiAlert = inject(UiAlertService);

      // no logueado
    if (!authService.isLoggedIn()) {
      uiAlert.show({
        variant: 'warning',
        tone: 'soft',
        title: 'Warning alert',
        message: 'Debes iniciar sesión para acceder a esta página.',
        timeoutMs: 5000,
      });
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // logueado pero sin rol adecuado
    if (!authService.hasRole(...alowedRoles)) {
      uiAlert.show({
        variant: 'error',
        tone: 'soft',
        title: 'Error',
        message: 'No tienes permisos para acceder a esta página.',
        timeoutMs: 5000,
      });
      return router.createUrlTree(['/hall']);
    }


    //tofdo bien
  return true;
};
