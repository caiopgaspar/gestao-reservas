import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService, UsuarioResponseDto, UsuarioRequestDto, FiltroUsuario, UsuarioAuthDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class Usuario implements OnInit {

  // Dados
  usuarios: UsuarioResponseDto[] = [];
  usuarioAutenticado: UsuarioResponseDto | null = null;
  usuarioEditando?: UsuarioResponseDto;

  // Formulários
  cadastroForm: FormGroup;
  perfilForm: FormGroup;
  filtroForm: FormGroup;

  // Estados
  carregando = false;
  carregandoLista = false;
  editando = false;
  modoCadastro = false;
  isAdmin = false;

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService,
    public router: Router,
    private fb: FormBuilder
  ) {
    // Verificar autenticação
    this.usuarioAutenticado = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isUserAdmin();

    // Se estiver autenticado, define modoCadastro como false
    this.modoCadastro = !this.authService.isAuthenticated();

    // Formulário de CADASTRO (para não autenticados)
    this.cadastroForm = this.fb.group({
      matricula: ['', [Validators.required, Validators.maxLength(5), this.matriculaValidator]],
      nomeCompleto: ['', [Validators.required, Validators.maxLength(100)]],
      nomeUsuario: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(7)]],
      confirmarSenha: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      lotacao: ['', [Validators.required]]
    }, { validators: this.senhasCoincidemValidator });

    // Formulário de PERFIL (para usuários autenticados)
    this.perfilForm = this.fb.group({
      nomeCompleto: [{ value: '', disabled: true }], // Não editável
      nomeUsuario: [{ value: '', disabled: true }],  // Não editável
      matricula: [{ value: '', disabled: true }],    // Não editável
      email: ['', [Validators.required, Validators.email]],
      lotacao: ['', [Validators.required]],
      senhaAtual: [''], // Opcional para alteração
      novaSenha: ['', [Validators.minLength(7)]],
      confirmarNovaSenha: ['']
    }, { validators: this.novasSenhasCoincidemValidator });

    // Formulário para FILTROS (apenas admin)
    this.filtroForm = this.fb.group({
      nomeCompleto: ['']
    });

    // Escuta mudanças nos filtros
    this.filtroForm.valueChanges.subscribe(() => {
      if (this.isAdmin) {
        this.aplicarFiltros();
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.carregarDadosPerfil();
      if (this.isAdmin) {
        this.carregarUsuarios();
      }
    }
  }

  // ========== MÉTODOS PARA NÃO AUTENTICADOS (CADASTRO) ==========

  onSubmitCadastro(): void {
    if (this.cadastroForm.invalid) {
      this.marcarCamposComoSujos(this.cadastroForm);
      return;
    }

    this.carregando = true;
    const usuarioData: UsuarioRequestDto = {
      matricula: this.cadastroForm.value.matricula,
      nomeCompleto: this.cadastroForm.value.nomeCompleto,
      nomeUsuario: this.cadastroForm.value.nomeUsuario,
      senha: this.cadastroForm.value.senha,
      email: this.cadastroForm.value.email,
      lotacao: this.cadastroForm.value.lotacao
    };

    this.usuarioService.cadastrar(usuarioData).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.cadastroForm.reset();
        this.carregando = false;
        // Redireciona para login após cadastro bem-sucedido
        this.router.navigate(['/login']);
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao cadastrar usuário:', erro);
        alert(`Erro ao cadastrar usuário: ${erro.error?.message || erro.message}`);
        this.carregando = false;
      }
    });
  }

  // ========== MÉTODOS PARA USUÁRIOS AUTENTICADOS ==========

  carregarDadosPerfil(): void {
    if (this.usuarioAutenticado) {
      this.perfilForm.patchValue({
        nomeCompleto: this.usuarioAutenticado.nomeCompleto,
        nomeUsuario: this.usuarioAutenticado.nomeUsuario,
        matricula: this.usuarioAutenticado.matricula,
        email: this.usuarioAutenticado.email,
        lotacao: this.usuarioAutenticado.lotacao
      });
    }
  }

  onSubmitPerfil(): void {
    if (this.perfilForm.invalid) {
      this.marcarCamposComoSujos(this.perfilForm);
      return;
    }

    this.carregando = true;
    const usuarioData: UsuarioRequestDto = {
      id: this.usuarioAutenticado!.id,
      nomeCompleto: this.usuarioAutenticado!.nomeCompleto, // Mantém o original
      nomeUsuario: this.usuarioAutenticado!.nomeUsuario,   // Mantém o original
      matricula: this.usuarioAutenticado!.matricula,       // Mantém o original
      email: this.perfilForm.value.email,
      lotacao: this.perfilForm.value.lotacao,
      // Só envia senha se foi preenchida
      senha: this.perfilForm.value.novaSenha || undefined
    };

    this.usuarioService.atualizar(this.usuarioAutenticado!.id, usuarioData).subscribe({
      next: (usuarioAtualizado) => {
        alert('Perfil atualizado com sucesso!');
        // Atualiza os dados no auth service
        this.authService.login(usuarioAtualizado);
        this.usuarioAutenticado = usuarioAtualizado;
        this.carregando = false;
        this.perfilForm.patchValue({
          senhaAtual: '',
          novaSenha: '',
          confirmarNovaSenha: ''
        });
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao atualizar perfil:', erro);
        alert(`Erro ao atualizar perfil: ${erro.error?.message || erro.message}`);
        this.carregando = false;
      }
    });
  }

  // ========== MÉTODOS PARA ADMINISTRADORES ==========

  carregarUsuarios(): void {
    this.carregandoLista = true;

    const filtros: FiltroUsuario = this.filtroForm.value;
    if (!filtros.nomeCompleto) delete filtros.nomeCompleto;

    this.usuarioService.buscar(filtros).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregandoLista = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar usuários:', erro);
        alert('Erro ao carregar usuários');
        this.carregandoLista = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.carregarUsuarios();
  }

  limparFiltros(): void {
    this.filtroForm.reset();
    this.carregarUsuarios();
  }

  editarUsuario(usuario: UsuarioResponseDto): void {
    this.editando = true;
    this.usuarioEditando = usuario;
    this.modoCadastro = true; // Muda para modo cadastro para edição

    this.cadastroForm.patchValue({
      matricula: usuario.matricula,
      nomeCompleto: usuario.nomeCompleto,
      nomeUsuario: usuario.nomeUsuario,
      senha: '', // Senha em branco para edição
      confirmarSenha: '',
      email: usuario.email,
      lotacao: usuario.lotacao
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deletarUsuario(id: number): void {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      this.usuarioService.deletar(id).subscribe({
        next: () => {
          alert('Usuário excluído com sucesso!');
          this.carregarUsuarios();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao excluir usuário:', erro);
          alert('Erro ao excluir usuário: ' + (erro.error?.message || erro.message));
        }
      });
    }
  }

  cancelarEdicao(): void {
    this.editando = false;
    this.usuarioEditando = undefined;
    this.modoCadastro = false;
    this.cadastroForm.reset();
  }

  novoUsuario(): void {
    this.editando = false;
    this.usuarioEditando = undefined;
    this.modoCadastro = true;
    this.cadastroForm.reset();
  }

  // ========== VALIDADORES ==========

  private matriculaValidator(control: AbstractControl): ValidationErrors | null {
    const matricula = control.value;
    if (matricula && !/^\d+$/.test(matricula)) {
      return { 'matriculaInvalida': true };
    }
    return null;
  }

  private senhasCoincidemValidator(group: AbstractControl): ValidationErrors | null {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha && confirmarSenha && senha !== confirmarSenha ? { 'senhasNaoCoincidem': true } : null;
  }

  private novasSenhasCoincidemValidator(group: AbstractControl): ValidationErrors | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarNovaSenha = group.get('confirmarNovaSenha')?.value;
    return novaSenha && confirmarNovaSenha && novaSenha !== confirmarNovaSenha ? { 'novasSenhasNaoCoincidem': true } : null;
  }

  private marcarCamposComoSujos(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }
}
