import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuarioService, UsuarioResponseDto, UsuarioRequestDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-usuario-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-cadastro.html',
  styleUrls: ['./usuario-cadastro.css']
})
export class UsuarioCadastro implements OnInit {

  usuarioForm!: FormGroup;

  salvando = false;
  carregando = false;
  editando = false;
  usuarioId?: number;

  usuarioAutenticado: UsuarioResponseDto | null = null;
  isAdmin = false;
  editandoProprioPerfil = false;
  editandoOutroUsuario = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.usuarioAutenticado = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isUserAdmin();
  }

  ngOnInit(): void {
    console.log('UsuarioCadastro - ngOnInit');
    console.log('isAdmin:', this.isAdmin);
    console.log('usuarioAutenticado:', this.usuarioAutenticado);

    // Verificar autenticação primeiro
    if (!this.authService.isAuthenticated() && !this.isAdmin) {
      // Caso: novo usuário não autenticado (cadastro público) - permite acesso
      console.log('Novo cadastro público');
      this.initializeForm();
      this.habilitarTodosCampos();
      return;
    }

    const id = this.route.snapshot.params['id'];
    console.log('ID da rota:', id);

    // CASO 1: Usuário não admin
    if (!this.isAdmin) {
      // Se está tentando acessar /usuario/cadastro sem ID, redireciona para editar próprio perfil
      if (!id) {
        console.log('Não admin sem ID, redirecionando para edição do próprio perfil');
        this.router.navigate(['/usuario/cadastro', this.usuarioAutenticado?.id]);
        return;
      }

      // Se está tentando editar outro usuário, redireciona para próprio perfil
      if (id && this.usuarioAutenticado && +id !== this.usuarioAutenticado.id) {
        console.log('Tentativa de editar outro usuário, redirecionando');
        alert('Você não tem permissão para editar outros usuários');
        this.router.navigate(['/usuario/cadastro', this.usuarioAutenticado.id]);
        return;
      }

      // Caso válido: editando próprio perfil
      this.editando = true;
      this.usuarioId = this.usuarioAutenticado?.id;
      this.editandoProprioPerfil = true;
      this.initializeForm();
      this.carregarUsuarioParaEdicao();
      return;
    }

    // CASO 2: Usuário admin
    if (this.isAdmin) {
      if (id) {
        // Editando usuário (pode ser admin editando qualquer um)
        this.editando = true;
        this.usuarioId = +id;
        this.editandoProprioPerfil = (this.usuarioId === this.usuarioAutenticado?.id);
        this.editandoOutroUsuario = !this.editandoProprioPerfil;
        this.initializeForm();
        this.carregarUsuarioParaEdicao();
      } else {
        // Criando novo usuário
        this.editando = false;
        this.initializeForm();
        this.habilitarTodosCampos();
      }
      return;
    }

    // CASO 3: Fallback - nenhum dos casos acima
    console.log('Nenhum caso correspondido, redirecionando para login');
    this.router.navigate(['/login']);
  }

  private initializeForm(): void {
    const id = this.route.snapshot.params['id'];

    if (this.isAdmin) {
      // ADMIN - formulário completo
      this.usuarioForm = this.fb.group({
        matricula: ['', [Validators.required, Validators.maxLength(5), this.matriculaValidator]],
        nomeCompleto: ['', [Validators.required, Validators.maxLength(100)]],
        nomeUsuario: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        lotacao: ['', [Validators.required]],
        senha: ['', id ? [Validators.minLength(7)] : [Validators.required, Validators.minLength(7)]],
        confirmarSenha: ['']
      }, { validators: this.senhasCoincidemValidator });

    } else if (this.editando && !this.isAdmin) {
      // USUÁRIO COMUM EDITANDO PRÓPRIO PERFIL
      this.usuarioForm = this.fb.group({
        matricula: [{ value: '', disabled: true }],
        nomeCompleto: [{ value: '', disabled: true }],
        nomeUsuario: [{ value: '', disabled: true }],
        email: ['', [Validators.required, Validators.email]],
        lotacao: ['', [Validators.required]],
        novaSenha: ['', [Validators.minLength(7)]],
        confirmarNovaSenha: ['']
      }, { validators: this.novasSenhasCoincidemValidator });

    } else {
      // NOVO USUÁRIO NÃO AUTENTICADO (cadastro público)
      this.usuarioForm = this.fb.group({
        matricula: ['', [Validators.required, Validators.maxLength(5), this.matriculaValidator]],
        nomeCompleto: ['', [Validators.required, Validators.maxLength(100)]],
        nomeUsuario: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        lotacao: ['', [Validators.required]],
        senha: ['', [Validators.required, Validators.minLength(7)]],
        confirmarSenha: ['']
      }, { validators: this.senhasCoincidemValidator });
    }
  }

  private carregarUsuarioParaEdicao(): void {
    const id = this.usuarioId || this.usuarioAutenticado?.id;

    if (!id) {
      console.error('ID do usuário não encontrado');
      this.router.navigate(['/usuario']);
      return;
    }

    this.carregando = true;

    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        console.log('Usuário carregado:', usuario);

        if (this.isAdmin) {
          // Admin pode editar todos os campos
          this.usuarioForm.patchValue({
            matricula: usuario.matricula,
            nomeCompleto: usuario.nomeCompleto,
            nomeUsuario: usuario.nomeUsuario,
            email: usuario.email,
            lotacao: usuario.lotacao,
            senha: '',
            confirmarSenha: ''
          });
        } else {
          // Usuário comum só pode editar email, lotação e senha
          this.usuarioForm.patchValue({
            matricula: usuario.matricula,
            nomeCompleto: usuario.nomeCompleto,
            nomeUsuario: usuario.nomeUsuario,
            email: usuario.email,
            lotacao: usuario.lotacao,
            novaSenha: '',
            confirmarNovaSenha: ''
          });
        }

        this.carregando = false;
        this.habilitarTodosCampos();
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar usuário:', erro);
        alert('Erro ao carregar dados do usuário');
        this.carregando = false;
        this.router.navigate(['/usuario']);
      }
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid || this.salvando) {
      this.marcarCamposComoSujos();
      return;
    }

    this.salvando = true;
    this.desabilitarTodosCampos();

    // CASO 1: Admin criando/atualizando
    if (this.isAdmin) {
      const usuarioData: UsuarioRequestDto = {
        matricula: this.usuarioForm.value.matricula,
        nomeCompleto: this.usuarioForm.value.nomeCompleto,
        nomeUsuario: this.usuarioForm.value.nomeUsuario,
        email: this.usuarioForm.value.email,
        lotacao: this.usuarioForm.value.lotacao,
        senha: this.usuarioForm.value.senha || undefined
      };

      if (this.editando && this.usuarioId) {
        usuarioData.id = this.usuarioId;
      }

      const operacao = this.editando && this.usuarioId
        ? this.usuarioService.atualizar(this.usuarioId, usuarioData)
        : this.usuarioService.cadastrar(usuarioData);

      operacao.subscribe({
        next: (usuarioSalvo) => {
          let mensagemSucesso = `Usuário ${this.editando ? 'atualizado' : 'cadastrado'} com sucesso!`;

          if (this.editandoProprioPerfil) {
            this.authService.login(usuarioSalvo);
            mensagemSucesso = 'Seu perfil foi atualizado com sucesso!';
          }

          alert(mensagemSucesso);
          this.router.navigate(['/usuario']);
        },
        error: (erro: HttpErrorResponse) => {
          this.tratarErro(erro);
        }
      });
    }
    // CASO 2: Usuário comum autenticado atualizando próprio perfil
    else if (this.authService.isAuthenticated() && this.usuarioAutenticado) {
      const usuarioData: UsuarioRequestDto = {
        id: this.usuarioAutenticado.id,
        nomeCompleto: this.usuarioAutenticado.nomeCompleto,
        nomeUsuario: this.usuarioAutenticado.nomeUsuario,
        matricula: this.usuarioAutenticado.matricula,
        email: this.usuarioForm.value.email,
        lotacao: this.usuarioForm.value.lotacao,
        senha: this.usuarioForm.value.novaSenha || undefined
      };

      this.usuarioService.atualizar(this.usuarioAutenticado.id, usuarioData).subscribe({
        next: (usuarioAtualizado) => {
          alert('Perfil atualizado com sucesso!');
          this.authService.login(usuarioAtualizado);
          this.usuarioForm.patchValue({
            novaSenha: '',
            confirmarNovaSenha: ''
          });
          this.salvando = false;
          this.habilitarTodosCampos();
          this.router.navigate(['/index']);
        },
        error: (erro: HttpErrorResponse) => {
          this.tratarErro(erro);
        }
      });
    }
    // CASO 3: NOVO USUÁRIO NÃO AUTENTICADO (cadastro público)
    else {
      const usuarioData: UsuarioRequestDto = {
        matricula: this.usuarioForm.value.matricula,
        nomeCompleto: this.usuarioForm.value.nomeCompleto,
        nomeUsuario: this.usuarioForm.value.nomeUsuario,
        email: this.usuarioForm.value.email,
        lotacao: this.usuarioForm.value.lotacao,
        senha: this.usuarioForm.value.senha
      };

      this.usuarioService.cadastrar(usuarioData).subscribe({
        next: (usuarioSalvo) => {
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
          this.router.navigate(['/login']);
        },
        error: (erro: HttpErrorResponse) => {
          this.tratarErro(erro);
        }
      });
    }
  }

  private tratarErro(erro: HttpErrorResponse): void {
    console.error('Erro ao salvar usuário:', erro);

    let mensagemErro = `Erro ao ${this.editando ? 'atualizar' : 'cadastrar'} usuário`;

    if (erro.status === 400) {
      mensagemErro = 'Dados inválidos. Verifique os campos.';
    } else if (erro.status === 409) {
      mensagemErro = 'Já existe um usuário com esta matrícula ou nome de usuário.';
    } else if (erro.error?.message) {
      mensagemErro = erro.error.message;
    }

    alert(mensagemErro);
    this.salvando = false;
    this.habilitarTodosCampos();
  }

  cancelar(): void {
    if (this.isAdmin) {
      this.router.navigate(['/usuario']);
    } else {
      this.router.navigate(['/index']);
    }
  }

  // Validações
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

  private marcarCamposComoSujos(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      this.usuarioForm.get(key)?.markAsTouched();
    });
  }

  private desabilitarTodosCampos(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      if (control) {
        control.disable();
      }
    });
  }

  private habilitarTodosCampos(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      if (control) {
        // Para usuário comum editando próprio perfil, mantém campos de identificação desabilitados
        if (!this.isAdmin && this.editando && ['matricula', 'nomeCompleto', 'nomeUsuario'].includes(key)) {
          control.disable();
        } else {
          control.enable();
        }
      }
    });
  }
}
