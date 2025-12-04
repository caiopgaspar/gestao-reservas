import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class AppComponent {

  title = 'Gestão de Reservas';
  sidebarExpanded = false;

  constructor(
      public authService: AuthService,
      private router: Router
    ) {}

    onLogout(): void {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

  toggleSidebar() {
      this.sidebarExpanded = !this.sidebarExpanded;
  }


}
