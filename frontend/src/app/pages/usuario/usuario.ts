import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService, UsuarioResponseDto, FiltroUsuario } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class Usuario implements OnInit {

  usuarios: UsuarioResponseDto[] = [];
  todosUsuarios: UsuarioResponseDto[] = []; // Armazena todos os usuários para filtragem local
  filtroForm: FormGroup;

  carregandoLista = false;
  carregandoTodos = false;
  filtrosAplicados = false;
  mostrarInstrucoes = true;

  usuarioAutenticado: UsuarioResponseDto | null = null;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.usuarioAutenticado = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isUserAdmin();

    // Formulário com todos os campos de filtro
    this.filtroForm = this.fb.group({
      nomeCompleto: [''],
      nomeUsuario: [''],
      email: [''],
      lotacao: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.isAdmin) {
      // Se não for admin, redireciona para edição do próprio perfil
      this.router.navigate(['/usuario/cadastro']);
      return;
    }

    this.desabilitarCamposFiltro();
    this.carregarTodosUsuarios(); // Carrega todos os usuários uma vez
    this.mostrarInstrucoes = true;
    this.filtrosAplicados = false;
  }

  // Carrega todos os usuários para filtragem local
  carregarTodosUsuarios(): void {
    this.carregandoTodos = true;

    setTimeout(() => {
      this.usuarioService.buscarTodos().subscribe({
        next: (usuarios) => {
          this.todosUsuarios = usuarios;
          this.carregandoTodos = false;
          this.habilitarCamposFiltro();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar usuários:', erro);
          alert('Erro ao carregar usuários');
          this.carregandoTodos = false;
          this.habilitarCamposFiltro();
        }
      });
    }, 300);
  }

  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      this.carregarUsuarios();
    }
  }

  carregarUsuarios(): void {
    this.carregandoLista = true;
    this.mostrarInstrucoes = false;
    this.filtrosAplicados = true;
    this.desabilitarCamposFiltro();

    const filtros = this.filtroForm.value;
    const filtrosBackend: FiltroUsuario = {};

    // Apenas nomeCompleto será usado para busca no backend
    if (filtros.nomeCompleto && filtros.nomeCompleto.trim() !== '') {
      filtrosBackend.nomeCompleto = filtros.nomeCompleto.trim();
    }

    setTimeout(() => {
      if (Object.keys(filtrosBackend).length > 0) {
        // Se tem filtro no backend, busca com filtro
        this.usuarioService.buscar(filtrosBackend).subscribe({
          next: (usuarios) => {
            // Aplica filtros adicionais no frontend
            this.usuarios = this.aplicarFiltrosFrontend(usuarios, filtros);
            this.carregandoLista = false;
            this.habilitarCamposFiltro();
          },
          error: (erro: HttpErrorResponse) => {
            console.error('Erro ao carregar usuários:', erro);
            alert('Erro ao carregar usuários');
            this.carregandoLista = false;
            this.habilitarCamposFiltro();
          }
        });
      } else {
        // Se não tem filtro no backend, usa todos os usuários carregados
        this.usuarios = this.aplicarFiltrosFrontend(this.todosUsuarios, filtros);
        this.carregandoLista = false;
        this.habilitarCamposFiltro();
      }
    }, 500);
  }

  // Aplica filtros adicionais no frontend
  private aplicarFiltrosFrontend(usuarios: UsuarioResponseDto[], filtros: any): UsuarioResponseDto[] {
    let resultado = [...usuarios]; // Cria uma cópia

    if (filtros.nomeUsuario && filtros.nomeUsuario.trim() !== '') {
      const busca = filtros.nomeUsuario.trim().toLowerCase();
      resultado = resultado.filter(usuario =>
        usuario.nomeUsuario.toLowerCase().includes(busca)
      );
    }

    if (filtros.email && filtros.email.trim() !== '') {
      const busca = filtros.email.trim().toLowerCase();
      resultado = resultado.filter(usuario =>
        usuario.email.toLowerCase().includes(busca)
      );
    }

    if (filtros.lotacao && filtros.lotacao.trim() !== '') {
      const busca = filtros.lotacao.trim().toLowerCase();
      resultado = resultado.filter(usuario =>
        usuario.lotacao.toLowerCase().includes(busca)
      );
    }

    return resultado;
  }

  limparFiltros(): void {
    this.desabilitarCamposFiltro();
    this.filtroForm.reset();
    this.usuarios = [];
    this.filtrosAplicados = false;
    this.mostrarInstrucoes = true;

    setTimeout(() => {
      this.habilitarCamposFiltro();
    }, 100);
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/usuario/cadastro']);
  }

  navegarParaEdicao(id: number): void {
    this.router.navigate(['/usuario/cadastro', id]);
  }

  navegarParaInicio(): void {
      this.router.navigate(['/index']);
  }

  deletarUsuario(id: number): void {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      this.usuarioService.deletar(id).subscribe({
        next: () => {
          alert('Usuário excluído com sucesso!');
          // Atualiza a lista de todos os usuários
          this.carregarTodosUsuarios();
          // Reaplica os filtros atuais
          this.carregarUsuarios();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao excluir usuário:', erro);
          alert('Erro ao excluir usuário: ' + (erro.error?.message || erro.message));
        }
      });
    }
  }

  // Verifica se há algum filtro preenchido
  temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }

  // Métodos para controle de campos
  private desabilitarCamposFiltro(): void {
    Object.keys(this.filtroForm.controls).forEach(key => {
      const control = this.filtroForm.get(key);
      if (control) {
        control.disable();
      }
    });
  }

  private habilitarCamposFiltro(): void {
    Object.keys(this.filtroForm.controls).forEach(key => {
      const control = this.filtroForm.get(key);
      if (control && control.enabled === false) {
        control.enable();
      }
    });
  }
}
