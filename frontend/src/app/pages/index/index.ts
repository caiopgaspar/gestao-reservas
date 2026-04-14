import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService, ReservaResponseDto, StatusReservaEnum } from '../../services/reserva';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { AuthService } from '../../services/auth';
import { forkJoin, of, catchError, finalize, timeout } from 'rxjs';

interface DiaCalendario {
  data: Date;
  dia: number;
  temReserva: boolean;
  quantidadeReservas: number;
  reservas: ReservaResponseDto[];
}

interface DadosGrafico {
  recurso: string;
  quantidade: number;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class Index implements OnInit {
  reservas: ReservaResponseDto[] = [];
  recursos: RecursoResponseDto[] = [];

  calendario: DiaCalendario[] = [];
  mesAtual: Date = new Date();
  diaSelecionado: DiaCalendario | null = null;
  mostrarModalDia = false;

  dadosGrafico: DadosGrafico[] = [];

  carregando = true;
  erroCarregamento = false;
  mensagemErro = '';

  mesNome = '';
  ano = 0;

  totalReservas = 0;
  totalRecursos = 0;
  reservasAgendadas = 0;
  reservasRealizadas = 0;

  constructor(
    private reservaService: ReservaService,
    private recursoService: RecursoService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.mesAtual = new Date();
    this.atualizarNomeMes();
    this.carregarDados();
  }

  atualizarNomeMes(): void {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.mesNome = meses[this.mesAtual.getMonth()];
    this.ano = this.mesAtual.getFullYear();
  }

  carregarDados(): void {
    this.carregando = true;
    this.erroCarregamento = false;
    this.mensagemErro = 'Dados não carregados';
    this.cdr.detectChanges();

    const reservas$ = this.reservaService.buscarTodas().pipe(
        timeout(1000),
        catchError(erro => {
          console.error('Erro ao carregar reservas:', erro);
          return of([]);
        })
      );

      const recursos$ = this.recursoService.buscarTodos().pipe(
        timeout(1000),
        catchError(erro => {
          console.error('Erro ao carregar recursos:', erro);
          return of([]);
        })
      );

      forkJoin({
        reservas: reservas$,
        recursos: recursos$
      }).pipe(
        finalize(() => {
          console.log('Finalize: carregando = false');
          this.cdr.detectChanges();
        })
      ).subscribe({
      next: (result) => {
        console.log('Dados carregados:', {
          reservas: result.reservas.length,
          recursos: result.recursos.length
        });

        this.reservas = result.reservas;
        this.recursos = result.recursos;

        if (result.reservas.length === 0 && result.recursos.length === 0) {
          this.erroCarregamento = true;
          this.mensagemErro = 'Não foi possível carregar os dados. Verifique sua conexão.';
        }

        // Calcular estatísticas
        this.totalReservas = this.reservas.length;
        this.totalRecursos = this.recursos.length;
        this.reservasAgendadas = this.reservas.filter(r => r.status === StatusReservaEnum.AGENDADA).length;
        this.reservasRealizadas = this.reservas.filter(r => r.status === StatusReservaEnum.REALIZADA).length;

        // Gerar calendário e gráfico
        this.gerarCalendario();
        this.gerarDadosGrafico();
        this.cdr.detectChanges();
        console.log('Dados processados com sucesso');
      },
      error: (erro) => {
        console.error('Erro fatal ao carregar dados:', erro);
        this.erroCarregamento = true;
        this.mensagemErro = 'Erro ao carregar os dados. Tente novamente mais tarde.';
        this.carregando = false;

        // Inicializar com arrays vazios
        this.reservas = [];
        this.recursos = [];
        this.gerarCalendario();
        this.gerarDadosGrafico();
        this.cdr.detectChanges();
      }
    });

    this.carregando = false;
  }

  gerarCalendario(): void {
    console.log('Gerando calendário para:', this.mesNome, this.ano);
    console.log('Reservas disponíveis:', this.reservas.length);

    this.calendario = [];

    const primeiroDia = new Date(this.ano, this.mesAtual.getMonth(), 1);
    const ultimoDia = new Date(this.ano, this.mesAtual.getMonth() + 1, 0);
    const diaSemanaPrimeiro = primeiroDia.getDay();
    const diasNoMes = ultimoDia.getDate();

    // Dias do mês anterior para preencher
    const ultimoDiaMesAnterior = new Date(this.ano, this.mesAtual.getMonth(), 0).getDate();
    for (let i = diaSemanaPrimeiro - 1; i >= 0; i--) {
      const data = new Date(this.ano, this.mesAtual.getMonth() - 1, ultimoDiaMesAnterior - i);
      this.adicionarDia(data);
    }

    // Dias do mês atual
    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(this.ano, this.mesAtual.getMonth(), i);
      this.adicionarDia(data);
    }

    // Dias do próximo mês para completar a grade (6 semanas = 42 dias)
    const totalDias = this.calendario.length;
    const diasRestantes = 42 - totalDias;
    for (let i = 1; i <= diasRestantes; i++) {
      const data = new Date(this.ano, this.mesAtual.getMonth() + 1, i);
      this.adicionarDia(data);
    }

    console.log('Calendário gerado:', this.calendario.length, 'dias');
  }

  adicionarDia(data: Date): void {
    const dataStr = this.formatarDataParaComparacao(data);

    const reservasDoDia = this.reservas.filter(reserva => {
      if (!reserva.dataHoraInicio) return false;
      if (reserva.status === StatusReservaEnum.CANCELADA) return false;
      const inicioReserva = reserva.dataHoraInicio.split('T')[0];
      return inicioReserva === dataStr;
    });

    this.calendario.push({
      data: data,
      dia: data.getDate(),
      temReserva: reservasDoDia.length > 0,
      quantidadeReservas: reservasDoDia.length,
      reservas: reservasDoDia
    });
  }

  formatarDataParaComparacao(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  gerarDadosGrafico(): void {
    console.log('Gerando gráfico com:', this.reservas.length, 'reservas');

    if (this.reservas.length === 0 || this.recursos.length === 0) {
      this.dadosGrafico = [];
      return;
    }

    const mapa = new Map<string, number>();

    const reservasAtivas = this.reservas.filter(r => r.status !== StatusReservaEnum.CANCELADA);

    reservasAtivas.forEach(reserva => {
      const recurso = this.recursos.find(r => r.id === reserva.recursoId);
      const label = recurso
        ? `${recurso.codigoIdentificacao} - ${recurso.nome}`
        : `Recurso ${reserva.recursoId}`;

      const atual = mapa.get(label) || 0;
      mapa.set(label, atual + 1);
    });

    this.dadosGrafico = Array.from(mapa.entries())
      .map(([recurso, quantidade]) => ({ recurso, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    console.log('Gráfico gerado:', this.dadosGrafico.length, 'itens');
  }

  mesAnterior(): void {
    this.mesAtual = new Date(this.ano, this.mesAtual.getMonth() - 1, 1);
    this.atualizarNomeMes();
    this.gerarCalendario();
  }

  mesProximo(): void {
    this.mesAtual = new Date(this.ano, this.mesAtual.getMonth() + 1, 1);
    this.atualizarNomeMes();
    this.gerarCalendario();
  }

  selecionarDia(dia: DiaCalendario): void {
    if (dia.reservas.length > 0) {
      this.diaSelecionado = dia;
      this.mostrarModalDia = true;
    }
  }

  fecharModal(): void {
    this.mostrarModalDia = false;
    this.diaSelecionado = null;
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case StatusReservaEnum.AGENDADA:
        return 'bg-warning text-dark';
      case StatusReservaEnum.REALIZADA:
        return 'bg-success';
      case StatusReservaEnum.CANCELADA:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getMaxQuantidadeGrafico(): number {
    if (this.dadosGrafico.length === 0) return 1;
    return Math.max(...this.dadosGrafico.map(d => d.quantidade));
  }

  getAlturaBarra(qtd: number): number {
    const max = this.getMaxQuantidadeGrafico();
    if (max === 0) return 0;
    return (qtd / max) * 100;
  }

  recarregar(): void {
    this.carregarDados()
  }
}
