import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    alert('Debes iniciar sesión para acceder a esta página.');
     return router.createUrlTree(['/login'],{
    queryParams: { returnUrl: state.url } //esto lo q hace es que devuelve al usuario a donde estaba antes 
  });
  
  }

  return true;

 
  
};
