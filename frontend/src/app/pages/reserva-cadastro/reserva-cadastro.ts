import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservaService, ReservaResponseDto, ReservaRequestDto } from '../../services/reserva';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { UsuarioService, UsuarioResponseDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reserva-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva-cadastro.html',
  styleUrls: ['./reserva-cadastro.css']
})
export class ReservaCadastro implements OnInit {

  recursos: RecursoResponseDto[] = [];
  usuarios: UsuarioResponseDto[] = [];

  reservaForm: FormGroup;

  carregando = false;
  carregandoRecursos = false;
  carregandoUsuarios = false;
  editando = false;
  reservaId?: number;

  usuarioLogado: UsuarioResponseDto | null = null;
  isAdmin = false;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isUserAdmin();

    this.reservaForm = this.fb.group({
      dataHoraInicio: ['', [Validators.required]],
      dataHoraFim: ['', [Validators.required]],
      finalidade: ['', [Validators.maxLength(150)]],
      recursoId: ['', [Validators.required]],
      usuarioId: [this.usuarioLogado?.id || '', [Validators.required]]
    }, {
      validators: this.validarDatas.bind(this)
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa fazer login para criar/editar reservas');
      this.router.navigate(['/usuario']);
      return;
    }

    // Desabilitar todos os campos inicialmente
    this.desabilitarTodosCampos();

    // Carregar recursos
    this.carregarRecursos();

    // Verifica se é edição
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.editando = true;
      this.reservaId = +id;
      this.carregarReservaParaEdicao();
    } else {
      // Se não for edição, habilitar campos após carregar recursos
      setTimeout(() => {
        if (!this.carregandoRecursos) {
          this.habilitarTodosCampos();
        }
      }, 100);
    }

    if (this.isAdmin) {
      this.carregarUsuarios();
    } else {
      // Para não-admin, desabilitar o campo usuário (sempre será o usuário logado)
      const usuarioControl = this.reservaForm.get('usuarioId');
      if (usuarioControl) {
        usuarioControl.disable();
      }
    }
  }

  private validarDatas(formGroup: FormGroup) {
    const inicioControl = formGroup.get('dataHoraInicio');
    const fimControl = formGroup.get('dataHoraFim');

    const inicio = inicioControl?.value;
    const fim = fimControl?.value;

    if (!inicio || !fim) return null;

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (dataFim <= dataInicio) {
      fimControl?.setErrors({ dataFimAnterior: true });
      return { dataFimAnterior: true };
    }

    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 1);

    if (dataInicio < agora) {
      inicioControl?.setErrors({ dataNoPassado: true });
      return { dataNoPassado: true };
    }

    fimControl?.setErrors(null);
    inicioControl?.setErrors(null);
    return null;
  }

  private carregarReservaParaEdicao(): void {
    if (!this.reservaId) return;

    this.carregando = true;
    this.reservaService.buscarPorId(this.reservaId).subscribe({
      next: (reserva) => {
        const dataHoraInicio = this.formatarDataParaInput(reserva.dataHoraInicio);
        const dataHoraFim = this.formatarDataParaInput(reserva.dataHoraFim);

        this.reservaForm.patchValue({
          dataHoraInicio: dataHoraInicio,
          dataHoraFim: dataHoraFim,
          finalidade: reserva.finalidade || '',
          recursoId: reserva.recursoId,
          usuarioId: reserva.usuarioId
        });

        this.carregando = false;

        // Habilitar campos após carregar dados
        if (!this.carregandoRecursos && (!this.isAdmin || !this.carregandoUsuarios)) {
          this.habilitarTodosCampos();
        }
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar reserva:', erro);
        alert('Erro ao carregar reserva para edição');
        this.carregando = false;
        this.habilitarTodosCampos(); // Habilitar campos mesmo com erro
        this.router.navigate(['/reserva']);
      }
    });
  }

  carregarRecursos(): void {
    this.carregandoRecursos = true;

    setTimeout(() => {
      this.recursoService.buscarTodos().subscribe({
        next: (recursos) => {
          this.recursos = recursos;
          this.carregandoRecursos = false;

          // Se for cadastro novo (não edição), habilitar campos
          if (!this.editando) {
            this.habilitarTodosCampos();
          }
          // Se for edição e já carregou a reserva, habilitar campos
          if (this.editando && !this.carregando) {
            this.habilitarTodosCampos();
          }
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar recursos:', erro);
          alert('Erro ao carregar recursos');
          this.carregandoRecursos = false;
          this.habilitarTodosCampos();
        }
      });
    }, 300);
  }

  carregarUsuarios(): void {
    this.carregandoUsuarios = true;

    setTimeout(() => {
      this.usuarioService.buscarTodos().subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          this.carregandoUsuarios = false;

          // Habilitar campos após carregar usuários
          if (!this.carregando && !this.carregandoRecursos) {
            this.habilitarTodosCampos();
          }
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar usuários:', erro);
          alert('Erro ao carregar usuários');
          this.carregandoUsuarios = false;
          this.habilitarTodosCampos();
        }
      });
    }, 300);
  }

  onSubmit(): void {
    if (this.reservaForm.invalid) {
      this.marcarCamposComoSujos();
      return;
    }

    if (!this.isAdmin && !this.usuarioLogado) {
      alert('Erro: Usuário não está autenticado');
      return;
    }

    const inicio = new Date(this.reservaForm.get('dataHoraInicio')?.value);
    const fim = new Date(this.reservaForm.get('dataHoraFim')?.value);

    if (fim <= inicio) {
      alert('A data de término deve ser posterior à data de início');
      return;
    }

    this.carregando = true;
    this.desabilitarTodosCampos();

    const formValue = this.reservaForm.getRawValue();

    const reservaData: ReservaRequestDto = {
      ...formValue,
      dataHoraInicio: this.converterParaISO8601(formValue.dataHoraInicio),
      dataHoraFim: this.converterParaISO8601(formValue.dataHoraFim),
      usuarioId: this.isAdmin ? formValue.usuarioId : this.usuarioLogado!.id
    };

    console.log('Dados da reserva enviados:', reservaData);

    const operacao = this.editando && this.reservaId
      ? this.reservaService.atualizar(this.reservaId, reservaData)
      : this.reservaService.criar(reservaData);

    operacao.subscribe({
      next: () => {
        alert(`Reserva ${this.editando ? 'atualizada' : 'criada'} com sucesso!`);
        this.router.navigate(['/reserva']);
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro completo ao salvar reserva:', erro);

        let mensagemErro = `Erro ao ${this.editando ? 'atualizar' : 'criar'} reserva`;

        if (erro.error?.message) {
          mensagemErro += `: ${erro.error.message}`;
        } else if (erro.status === 400) {
          if (erro.error.includes('reserva_status_check')) {
            mensagemErro += ': Problema com o status da reserva. Contate o administrador.';
          } else {
            mensagemErro += ': Datas inválidas ou conflitantes';
          }
        } else if (erro.status === 500) {
          if (erro.error.includes('reserva_status_check')) {
            mensagemErro += ': Problema com o status da reserva. O valor "CONFIRMADA" não é permitido. Contate o administrador.';
          } else {
            mensagemErro += ': Erro interno do servidor';
          }
        } else {
          mensagemErro += ': Erro de comunicação com o servidor';
        }

        alert(mensagemErro);
        this.carregando = false;
        this.habilitarTodosCampos();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/reserva']);
  }

  private converterParaISO8601(dataHoraLocal: string): string {
    if (!dataHoraLocal) return dataHoraLocal;
    if (dataHoraLocal.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dataHoraLocal;
    }
    return dataHoraLocal + ':00';
  }

  private formatarDataParaInput(dataHora: string): string {
    const data = new Date(dataHora);
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');

    return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
  }

  private marcarCamposComoSujos(): void {
    Object.keys(this.reservaForm.controls).forEach(key => {
      this.reservaForm.get(key)?.markAsTouched();
    });
  }

  private desabilitarTodosCampos(): void {
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      if (control) {
        control.disable();
      }
    });
  }

  private habilitarTodosCampos(): void {
    Object.keys(this.reservaForm.controls).forEach(key => {
      const control = this.reservaForm.get(key);
      if (control && control.enabled === false) {
        // Para não-admin, não habilita o campo usuário (mantém desabilitado)
        if (key === 'usuarioId' && !this.isAdmin) {
          return;
        }
        control.enable();
      }
    });
  }
}
