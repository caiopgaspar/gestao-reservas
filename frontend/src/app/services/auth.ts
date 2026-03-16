import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UsuarioResponseDto } from './usuario';

export interface AuthResponse {
  mensagem: string;
  usuario?: UsuarioResponseDto;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioLogado = signal<UsuarioResponseDto | null>(null);
  private isAdmin = signal<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.carregarDoLocalStorage();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private carregarDoLocalStorage(): void {
      if (this.isBrowser()) {
        const savedUser = localStorage.getItem('usuarioLogado');
        const savedAdmin = localStorage.getItem('isAdmin');

        if (savedUser) {
          try {
            this.usuarioLogado.set(JSON.parse(savedUser));
          } catch (e) {
            console.error('Erro ao recuperar usuário:', e);
          }
        }

        if (savedAdmin) {
          try {
            this.isAdmin.set(JSON.parse(savedAdmin));
          } catch (e) {
            console.error('Erro ao recuperar admin:', e);
          }
        }
      }
  }

  login(usuario: UsuarioResponseDto): void {
    this.usuarioLogado.set(usuario);

    // Lógica para determinar se é admin baseado no nome de usuário TODO: alterar para roles
    const adminUsers = ['admin', 'administrador', 'gestor'];
    const nome = usuario.nomeUsuario ? usuario.nomeUsuario.toLowerCase() : '';
    const isUserAdmin = adminUsers.includes(nome);

    this.isAdmin.set(isUserAdmin);

    if (this.isBrowser()) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      localStorage.setItem('isAdmin', JSON.stringify(isUserAdmin));
    }
  }

  getUsuarioLogado(): UsuarioResponseDto | null {
    return this.usuarioLogado();
  }

  // Verificar se é admin
  isUserAdmin(): boolean {
    return this.isAdmin();
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return this.getUsuarioLogado() !== null;
  }

  // Logout
  logout(): void {
    this.usuarioLogado.set(null);
    this.isAdmin.set(false);

    if (this.isBrowser()) {
      localStorage.removeItem('usuarioLogado');
      localStorage.removeItem('isAdmin');
    }
  }

  // Método para extrair nome do usuário da mensagem de sucesso
  extractUserNameFromMessage(mensagem: string): string {
    const match = mensagem.match(/Bem-vindo, (.+)\.$/);
    return match ? match[1] : '';
  }
}
