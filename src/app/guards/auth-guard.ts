import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth-service';
import { UiAlertService } from '../services/Ui-alert/ui-alert';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const uiAlert = inject(UiAlertService);

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

  return true;
};
