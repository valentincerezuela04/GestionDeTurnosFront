import { Component, inject, output } from '@angular/core';
import { AuthService } from '../../services/Auth/auth-service';
import { Router } from '@angular/router';
import { ThemeToggle } from "../theme-toggle/theme-toggle";

@Component({
  selector: 'app-headear',
  imports: [ThemeToggle],
  standalone:true,
  templateUrl: './headear.html',
  styleUrl: './headear.css',
})
export class Headear {
  auth = inject(AuthService);
  private router = inject(Router);
  menuToongle = output<void>()
  onToongle(){this.menuToongle.emit()}


  logout(){    
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goLogin(){
    this.router.navigate(['/login']);
  }

  goRegister(){
    this.router.navigate(['/register']);
  }

  isRegisterRoute(): boolean {
    return this.router.url.startsWith('/register');
  }

  goProfile(){
    if(!this.auth.isLoggedIn()){
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/perfil']);
  }
}

