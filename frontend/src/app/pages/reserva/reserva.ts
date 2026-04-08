import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReservaService, ReservaResponseDto, FiltroReserva, StatusReservaEnum } from '../../services/reserva';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { UsuarioService, UsuarioResponseDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';
import { BarraAcoes } from '../barra-acoes/barra-acoes';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BarraAcoes],
  templateUrl: './reserva.html',
  styleUrls: ['./reserva.css']
})
export class Reserva implements OnInit {

  reservas: ReservaResponseDto[] = [];
  recursos: RecursoResponseDto[] = [];
  usuarios: UsuarioResponseDto[] = [];

  filtroForm: FormGroup;

  carregandoLista = false;
  carregandoRecursos = false;
  carregandoUsuarios = false;

  filtrosAplicados = false;
  mostrarInstrucoes = true;

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

    // Formulário para filtros
    this.filtroForm = this.fb.group({
      usuarioId: [''],
      recursoId: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      alert('Você precisa fazer login para acessar as reservas');
      this.router.navigate(['/usuario']);
      return;
    }

    this.desabilitarCamposFiltro();
    this.carregarRecursos();

    if (this.isAdmin) {
      this.carregarUsuarios();
    }

    this.mostrarInstrucoes = true;
    this.filtrosAplicados = false;
  }

  carregarRecursos(): void {
    this.carregandoRecursos = true;

    setTimeout(() => {
      this.recursoService.buscarTodos().subscribe({
        next: (recursos) => {
          this.recursos = recursos;
          this.carregandoRecursos = false;
          this.habilitarCampoFiltroRecurso();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar recursos:', erro);
          alert('Erro ao carregar recursos');
          this.carregandoRecursos = false;
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
          this.habilitarCampoFiltroUsuario();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar usuários:', erro);
          alert('Erro ao carregar usuários');
          this.carregandoUsuarios = false;
        }
      });
    }, 300);
  }

  carregarReservas(): void {
    this.carregandoLista = true;
    this.mostrarInstrucoes = false;
    this.filtrosAplicados = true;
    this.desabilitarCamposFiltro();

    const filtros: FiltroReserva = this.filtroForm.value;

    this.desabilitarCamposFiltro();

    if (!this.isAdmin && this.usuarioLogado) {
      filtros.usuarioId = this.usuarioLogado.id;
    }

    if (!filtros.usuarioId) delete filtros.usuarioId;
    if (!filtros.recursoId) delete filtros.recursoId;

    setTimeout(() => {
      this.reservaService.buscar(filtros).subscribe({
        next: (reservas) => {
          this.reservas = reservas;
          this.carregandoLista = false;
          this.habilitarCamposFiltro();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar reservas:', erro);
          alert('Erro ao carregar reservas');
          this.carregandoLista = false;
          this.habilitarCamposFiltro();
        }
      });
    }, 500);
  }

  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      this.carregarReservas();
    }
  }

  limparFiltros(): void {
    this.desabilitarCamposFiltro();
    this.filtroForm.reset();
    this.reservas = [];
    this.filtrosAplicados = false;
    this.mostrarInstrucoes = true;

    // Habilita campos após limpar
    setTimeout(() => {
      this.habilitarCamposFiltro();
    }, 100);
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/reserva/cadastro']);
  }

  navegarParaEdicao(id: number): void {
    this.router.navigate(['/reserva/cadastro', id]);
  }

  navegarParaInicio(): void {
      this.router.navigate(['/index']);
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

  // Verifica se há algum filtro preenchido
  temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }

  // Métodos para controle de campos do filtro
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
        // Só habilita filtro de usuário se for admin
        if (key === 'usuarioId' && !this.isAdmin) {
          return;
        }
        control.enable();
      }
    });
  }

  private habilitarCampoFiltroRecurso(): void {
    const recursoControl = this.filtroForm.get('recursoId');
    if (recursoControl && recursoControl.enabled === false) {
      recursoControl.enable();
    }
  }

  private habilitarCampoFiltroUsuario(): void {
    const usuarioControl = this.filtroForm.get('usuarioId');
    if (usuarioControl && usuarioControl.enabled === false) {
      usuarioControl.enable();
    }
  }
}
