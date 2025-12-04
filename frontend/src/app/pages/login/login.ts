import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService, UsuarioAuthDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  loginForm: FormGroup;
  carregando = false;
  mensagemErro?: string;
  mensagemSucesso?: string;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      nomeUsuario: ['', [Validators.required]],
      senha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Verificar autenticação apenas se estiver no navegador
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/index']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.marcarCamposComoSujos();
      return;
    }

    this.carregando = true;
    this.mensagemErro = undefined;
    this.mensagemSucesso = undefined;

    const authData: UsuarioAuthDto = this.loginForm.value;

    this.usuarioService.login(authData).subscribe({
      next: (mensagem: string) => {
        // Login bem-sucedido - buscar dados completos do usuário
        this.usuarioService.buscarPorNomeUsuario(authData.nomeUsuario).subscribe({
          next: (usuario) => {
            // Armazenar usuário no serviço de autenticação
            this.authService.login(usuario);
            this.mensagemSucesso = mensagem;
            this.carregando = false;

            // Redirecionar após login bem-sucedido
            setTimeout(() => {
              this.router.navigate(['/index']);
            }, 1500);
          },
          error: (erro: HttpErrorResponse) => {
            console.error('Erro ao buscar dados do usuário:', erro);
            this.mensagemErro = 'Erro ao obter dados do usuário após login';
            this.carregando = false;
          }
        });
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro no login:', erro);
        this.mensagemErro = erro.error || 'Erro ao realizar login. Verifique suas credenciais.';
        this.carregando = false;
      }
    });
  }

  private marcarCamposComoSujos(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
