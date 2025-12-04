import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReservaService, ReservaResponseDto, ReservaRequestDto, FiltroReserva, StatusReservaEnum } from '../../services/reserva';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { UsuarioService, UsuarioResponseDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva.html',
  styleUrls: ['./reserva.css']
})
export class Reserva implements OnInit {

  reservas: ReservaResponseDto[] = [];
  recursos: RecursoResponseDto[] = [];
  usuarios: UsuarioResponseDto[] = [];

  reservaForm: FormGroup;
  filtroForm: FormGroup;

  carregando = false;
  carregandoLista = false;
  carregandoUsuarios = false;
  editando = false;
  reservaEditando?: ReservaResponseDto;

  usuarioLogado: UsuarioResponseDto | null = null;
  isAdmin = false;

  statusReserva = StatusReservaEnum;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Inicializar usuário logado
    this.usuarioLogado = this.authService.getUsuarioLogado();
    this.isAdmin = this.authService.isUserAdmin();

    // Formulário principal com validação customizada
    this.reservaForm = this.fb.group({
      dataHoraInicio: ['', [Validators.required]],
      dataHoraFim: ['', [Validators.required]],
      finalidade: ['', [Validators.maxLength(150)]],
      recursoId: ['', [Validators.required]],
      usuarioId: [{
        value: this.usuarioLogado?.id || '',
        disabled: !this.isAdmin
      }, [Validators.required]]
    }, {
      validators: this.validarDatas.bind(this)
    });

    // Formulário para filtros
    this.filtroForm = this.fb.group({
      usuarioId: [''],
      recursoId: ['']
    });

    // Escuta mudanças nos filtros
    this.filtroForm.valueChanges.subscribe(() => {
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa fazer login para acessar as reservas');
      this.router.navigate(['/usuario']);
      return;
    }
    this.desabilitarCampoRecurso();
    this.desabilitarCampoUsuario();
    this.carregarReservas();
    this.carregarRecursos();
    this.carregarUsuarios();
  }

  private validarDatas(formGroup: FormGroup) {
    const inicioControl = formGroup.get('dataHoraInicio');
    const fimControl = formGroup.get('dataHoraFim');

    const inicio = inicioControl?.value;
    const fim = fimControl?.value;

    if (!inicio || !fim) return null;

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    // Valida se data fim é posterior à data início
    if (dataFim <= dataInicio) {
      fimControl?.setErrors({ dataFimAnterior: true });
      return { dataFimAnterior: true };
    }

    // Valida se não é no passado (com margem de 1 minuto)
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 1); // Margem de 1 minuto

    if (dataInicio < agora) {
      inicioControl?.setErrors({ dataNoPassado: true });
      return { dataNoPassado: true };
    }

    // Limpa erros se validação passar
    fimControl?.setErrors(null);
    inicioControl?.setErrors(null);
    return null;
  }

  carregarRecursos(): void {
      this.recursoService.buscarTodos().subscribe({
        next: (recursos) => {
          this.recursos = recursos;
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar recursos:', erro);
          alert('Erro ao carregar recursos');
        }
      });
  }

  carregarUsuarios(): void {
    if (!this.isAdmin) return;

    this.carregandoUsuarios = true;
    this.usuarioService.buscarTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregandoUsuarios = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar usuários:', erro);
        alert('Erro ao carregar usuários');
        this.carregandoUsuarios = false; 
      }
    });
  }

  carregarReservas(): void {
    this.carregandoLista = true;

    const filtros: FiltroReserva = this.filtroForm.value;

    if (!this.isAdmin && this.usuarioLogado) {
      filtros.usuarioId = this.usuarioLogado.id;
    }

    // Remove valores vazios
    if (!filtros.usuarioId) delete filtros.usuarioId;
    if (!filtros.recursoId) delete filtros.recursoId;

    this.reservaService.buscar(filtros).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.carregandoLista = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar reservas:', erro);
        alert('Erro ao carregar reservas');
        this.carregandoLista = false;
      }
    });
  }



  aplicarFiltros(): void {
    this.carregarReservas();
  }

  limparFiltros(): void {
    this.filtroForm.reset();
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

    // ✅ VALIDAÇÃO EXTRA DE DATAS
    const inicio = new Date(this.reservaForm.get('dataHoraInicio')?.value);
    const fim = new Date(this.reservaForm.get('dataHoraFim')?.value);

    if (fim <= inicio) {
      alert('A data de término deve ser posterior à data de início');
      return;
    }

    this.carregando = true;

    const formValue = this.reservaForm.getRawValue();

    // ✅ CORREÇÃO: Converter datas para o formato ISO 8601 que o Spring espera
    const reservaData: ReservaRequestDto = {
      ...formValue,
      // Converter para formato ISO 8601 completo
      dataHoraInicio: this.converterParaISO8601(formValue.dataHoraInicio),
      dataHoraFim: this.converterParaISO8601(formValue.dataHoraFim),
      usuarioId: this.isAdmin ? formValue.usuarioId : this.usuarioLogado!.id
    };

    console.log('Dados da reserva enviados:', reservaData);

    const operacao = this.editando
      ? this.reservaService.atualizar(this.reservaEditando!.id, reservaData)
      : this.reservaService.criar(reservaData);

    operacao.subscribe({
      next: () => {
        alert(`Reserva ${this.editando ? 'atualizada' : 'criada'} com sucesso!`);
        this.carregarReservas();
        this.reservaForm.reset();

        // ✅ Restaura o usuárioId após reset
        if (!this.isAdmin && this.usuarioLogado) {
          this.reservaForm.patchValue({ usuarioId: this.usuarioLogado.id });
        }

        this.editando = false;
        this.reservaEditando = undefined;
        this.carregando = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro completo ao salvar reserva:', erro);

        // ✅ TRATAMENTO MELHORADO DE ERROS
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
      }
    });
  }

  // ✅ MÉTODO CORRIGIDO: Converter para ISO 8601 (formato que Spring/LocalDateTime espera)
  private converterParaISO8601(dataHoraLocal: string): string {
    if (!dataHoraLocal) return dataHoraLocal;

    // O input datetime-local retorna: "YYYY-MM-DDTHH:mm"
    // Precisamos converter para: "YYYY-MM-DDTHH:mm:ss" (formato ISO 8601 sem timezone)

    // Se já tiver segundos, retorna como está
    if (dataHoraLocal.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return dataHoraLocal;
    }

    // Adiciona segundos (:00) se não tiver
    // Formato final: "2025-11-28T10:00:00"
    return dataHoraLocal + ':00';
  }

  editarReserva(reserva: ReservaResponseDto): void {
    this.editando = true;
    this.reservaEditando = reserva;

    // ✅ CORREÇÃO: Usa o método corrigido de formatação
    const dataHoraInicio = this.formatarDataParaInput(reserva.dataHoraInicio);
    const dataHoraFim = this.formatarDataParaInput(reserva.dataHoraFim);

    console.log('Editando reserva - Datas:', {
      original: { inicio: reserva.dataHoraInicio, fim: reserva.dataHoraFim },
      formatada: { inicio: dataHoraInicio, fim: dataHoraFim }
    });

    this.reservaForm.patchValue({
      dataHoraInicio: dataHoraInicio,
      dataHoraFim: dataHoraFim,
      finalidade: reserva.finalidade || '',
      recursoId: reserva.recursoId,
      usuarioId: reserva.usuarioId
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarReserva(id: number): void {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      this.reservaService.deletar(id).subscribe({
        next: () => {
          alert('Reserva cancelada com sucesso!');
          this.carregarReservas();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao cancelar reserva:', erro);
          alert('Erro ao cancelar reserva: ' + (erro.error?.message || erro.message));
        }
      });
    }
  }

  deletarReserva(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.')) {
      this.reservaService.deletar(id).subscribe({
        next: () => {
          alert('Reserva excluída com sucesso!');
          this.carregarReservas();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao excluir reserva:', erro);
          alert('Erro ao excluir reserva: ' + (erro.error?.message || erro.message));
        }
      });
    }
  }

  cancelarEdicao(): void {
    this.editando = false;
    this.reservaEditando = undefined;
    this.reservaForm.reset();

    // ✅ Restaura o usuárioId após cancelar edição
    if (!this.isAdmin && this.usuarioLogado) {
      this.reservaForm.patchValue({ usuarioId: this.usuarioLogado.id });
    }
  }

  getBadgeClass(status: StatusReservaEnum): string {
    switch (status) {
      case StatusReservaEnum.CONFIRMADA:
        return 'bg-success';
      case StatusReservaEnum.PENDENTE:
        return 'bg-warning';
      case StatusReservaEnum.CANCELADA:
        return 'bg-danger';
      case StatusReservaEnum.CONCLUIDA:
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  formatarDataHora(dataHora: string): string {
    return new Date(dataHora).toLocaleString('pt-BR');
  }

  // ✅ MÉTODO CORRIGIDO: formatarDataParaInput
  private formatarDataParaInput(dataHora: string): string {
    // Remove os segundos e timezone para o input datetime-local
    const data = new Date(dataHora);

    // Formata manualmente para o formato YYYY-MM-DDTHH:mm
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

  private desabilitarCampoUsuario(): void {
        const usuarioControl = this.filtroForm.get('usuarioId');
        if (usuarioControl) {
          usuarioControl.disable();
        }
      }

      private habilitarCampoUsuario(): void {
        const usuarioControl = this.filtroForm.get('usuarioId');
        if (usuarioControl) {
          usuarioControl.enable();
        }
      }

      private desabilitarCampoRecurso(): void {
        const usuarioControl = this.filtroForm.get('recursoId');
        if (usuarioControl) {
          usuarioControl.disable();
        }
      }

      private habilitarCampoRecurso(): void {
        const usuarioControl = this.filtroForm.get('recursoId');
        if (usuarioControl) {
          usuarioControl.enable();
        }
      }

}
