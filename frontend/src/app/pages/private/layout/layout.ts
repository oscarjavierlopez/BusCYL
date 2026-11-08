import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthResponse } from '../../../models/auth-response';
import { AuthService } from '../../../services/auth.service';

declare const Swal: {
  fire: (options: {
    title: string;
    icon: 'warning';
    showCancelButton: boolean;
    confirmButtonText: string;
    cancelButtonText: string;
    confirmButtonColor: string;
  }) => Promise<{ isConfirmed: boolean }>;
};

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = signal<AuthResponse | null>(null);
  inicialesUsuario = computed(() => {
    const usuario = this.usuario();

    if (!usuario) {
      return '';
    }

    return `${usuario.nombre.trim().charAt(0)}${usuario.apellidos.trim().charAt(0)}`.toUpperCase();
  });

  ngOnInit(): void {
    this.usuario.set(JSON.parse(localStorage.getItem("usuario")!));
  }

  logout(): void {
    Swal.fire({
      title: '¿desea cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#bd1934',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/inicio-sesion']);
      }
    });
  }
}
