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

  usuarioForm: FormGroup;

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

    // Se não estiver autenticado, redireciona para login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/usuario']);
    }

    // Inicializar formulário vazio, será configurado no ngOnInit
    this.usuarioForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Desabilitar todos os campos inicialmente (será habilitado após carregamento)
    this.initializeForm();
    this.desabilitarTodosCampos();

    // Verificar se é edição de outro usuário (admin) ou próprio perfil
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.editando = true;
      this.usuarioId = +id;
      this.editandoProprioPerfil = (this.usuarioId === this.usuarioAutenticado?.id);
      this.editandoOutroUsuario = this.isAdmin && !this.editandoProprioPerfil;
      this.carregarUsuarioParaEdicao();
    } else {
      // Se não tem ID, está criando novo usuário (apenas admin)
      if (!this.isAdmin) {
        // Usuário comum editando próprio perfil
        this.editando = true;
        this.usuarioId = this.usuarioAutenticado!.id;
        this.editandoProprioPerfil = true;
        this.carregarUsuarioParaEdicao();
      } else {
        // Admin criando novo usuário - habilitar campos após inicializar
        setTimeout(() => {
          this.habilitarTodosCampos();
        }, 100);
      }
    }
  }

  private initializeForm(): void {
    if (this.isAdmin) {
      // Formulário completo para admin (pode editar todos os campos)
      this.usuarioForm = this.fb.group({
        matricula: ['', [Validators.required, Validators.maxLength(5), this.matriculaValidator]],
        nomeCompleto: ['', [Validators.required, Validators.maxLength(100)]],
        nomeUsuario: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        lotacao: ['', [Validators.required]],
        senha: ['', [Validators.minLength(7)]],
        confirmarSenha: ['']
      }, { validators: this.senhasCoincidemValidator });
    } else {
      // Formulário limitado para usuário comum
      this.usuarioForm = this.fb.group({
        matricula: [{ value: '', disabled: true }],
        nomeCompleto: [{ value: '', disabled: true }],
        nomeUsuario: [{ value: '', disabled: true }],
        email: ['', [Validators.required, Validators.email]],
        lotacao: ['', [Validators.required]],
        novaSenha: ['', [Validators.minLength(7)]],
        confirmarNovaSenha: ['']
      }, { validators: this.novasSenhasCoincidemValidator });
    }
  }

  private carregarUsuarioParaEdicao(): void {
    const id = this.usuarioId || this.usuarioAutenticado!.id;

    this.carregando = true;

    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        if (this.isAdmin) {
          // Admin pode editar TODOS os campos
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
        this.habilitarTodosCampos();
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

    if (this.isAdmin) {
      // Admin criando/atualizando usuário (todos os campos)
      const usuarioData: UsuarioRequestDto = {
        matricula: this.usuarioForm.value.matricula,
        nomeCompleto: this.usuarioForm.value.nomeCompleto,
        nomeUsuario: this.usuarioForm.value.nomeUsuario,
        email: this.usuarioForm.value.email,
        lotacao: this.usuarioForm.value.lotacao,
        senha: this.usuarioForm.value.senha || undefined
      };

      // Se for edição, adiciona o ID
      if (this.editando && this.usuarioId) {
        usuarioData.id = this.usuarioId;
      }

      const operacao = this.editando && this.usuarioId
        ? this.usuarioService.atualizar(this.usuarioId, usuarioData)
        : this.usuarioService.cadastrar(usuarioData);

      operacao.subscribe({
        next: (usuarioSalvo) => {
          let mensagemSucesso = `Usuário ${this.editando ? 'atualizado' : 'cadastrado'} com sucesso!`;

          // Se admin estiver editando próprio perfil, atualiza sessão
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
    } else {
      // Usuário comum atualizando próprio perfil
      const usuarioData: UsuarioRequestDto = {
        id: this.usuarioAutenticado!.id,
        nomeCompleto: this.usuarioAutenticado!.nomeCompleto,
        nomeUsuario: this.usuarioAutenticado!.nomeUsuario,
        matricula: this.usuarioAutenticado!.matricula,
        email: this.usuarioForm.value.email,
        lotacao: this.usuarioForm.value.lotacao,
        senha: this.usuarioForm.value.novaSenha || undefined
      };

      this.usuarioService.atualizar(this.usuarioAutenticado!.id, usuarioData).subscribe({
        next: (usuarioAtualizado) => {
          alert('Perfil atualizado com sucesso!');
          this.authService.login(usuarioAtualizado);
          this.usuarioForm.patchValue({
            novaSenha: '',
            confirmarNovaSenha: ''
          });
          this.salvando = false;
          this.habilitarTodosCampos();
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
    this.router.navigate(['/usuario']);
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
      if (control && control.enabled === false) {
        // Para usuário comum, mantém campos de identificação desabilitados
        if (!this.isAdmin && ['matricula', 'nomeCompleto', 'nomeUsuario'].includes(key)) {
          control.enable(); // Habilita mas mantém readonly
          control.disable(); // Marca como disabled
          return;
        }
        control.enable();
      }
    });
  }
}
