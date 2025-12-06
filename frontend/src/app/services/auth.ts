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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Método para verificar se está no navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Método para fazer login
  login(usuario: UsuarioResponseDto): void {
    this.usuarioLogado.set(usuario);

    // Lógica para determinar se é admin baseado no nome de usuário
    const adminUsers = ['admin', 'administrador', 'gestor'];
    const isUserAdmin = adminUsers.includes(usuario.nomeUsuario.toLowerCase());
    this.isAdmin.set(isUserAdmin);

    // Salvar no localStorage apenas se estiver no navegador
    if (this.isBrowser()) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      localStorage.setItem('isAdmin', JSON.stringify(isUserAdmin));
    }
  }

  // Método para obter o usuário logado
  getUsuarioLogado(): UsuarioResponseDto | null {
    if (!this.usuarioLogado()) {
      // Tentar recuperar do localStorage apenas se estiver no navegador
      if (this.isBrowser()) {
        const saved = localStorage.getItem('usuarioLogado');
        if (saved) {
          try {
            this.usuarioLogado.set(JSON.parse(saved));
          } catch (e) {
            console.error('Erro ao recuperar usuário do localStorage:', e);
            this.logout();
          }
        }
      }
    }
    return this.usuarioLogado();
  }

  // Verificar se é admin
  isUserAdmin(): boolean {
    if (!this.isAdmin()) {
      // Tentar recuperar do localStorage apenas se estiver no navegador
      if (this.isBrowser()) {
        const saved = localStorage.getItem('isAdmin');
        if (saved) {
          try {
            this.isAdmin.set(JSON.parse(saved));
          } catch (e) {
            console.error('Erro ao recuperar status admin do localStorage:', e);
            return false;
          }
        }
      }
    }
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

    // Limpar localStorage apenas se estiver no navegador
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
