import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatorioService, FiltroRelatorio } from '../../services/relatorio';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio.html',
  styleUrls: ['./relatorio.css']
})
export class Relatorio implements OnInit {
  carregando = false;
  recursos: RecursoResponseDto[] = [];

  filtros: FiltroRelatorio = {
    recursoId: undefined,
    dataInicio: '',
    dataFim: ''
  };

  constructor(
    private relatorioService: RelatorioService,
    private recursoService: RecursoService
  ) {}

  ngOnInit(): void {
    this.carregarRecursos();
  }

  carregarRecursos(): void {
    this.recursoService.buscarTodos().subscribe({
      next: (recursos) => {
        this.recursos = recursos;
      },
      error: (erro) => {
        console.error('Erro ao carregar recursos:', erro);
      }
    });
  }

  gerarRelatorioRecursos(): void {
    this.carregando = true;

    this.relatorioService.gerarRelatorioRecursos().subscribe({
      next: (blob: Blob) => {
        this.downloadPdf(blob, 'relatorio_recursos');
        this.carregando = false;
      },
      error: (erro: Error) => {
        console.error('Erro ao gerar relatório:', erro);
        alert('Erro ao gerar relatório de recursos. Tente novamente.');
        this.carregando = false;
      }
    });
  }

  gerarRelatorioReservas(): void {
    this.carregando = true;

    this.relatorioService.gerarRelatorioReservas(this.filtros).subscribe({
      next: (blob: Blob) => {
        this.downloadPdf(blob, 'relatorio_reservas');
        this.carregando = false;
      },
      error: (erro: Error) => {
        console.error('Erro ao gerar relatório:', erro);
        alert('Erro ao gerar relatório de reservas. Tente novamente.');
        this.carregando = false;
      }
    });
  }

  private downloadPdf(blob: Blob, nomeBase: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dataAtual = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.href = url;
    link.download = `${nomeBase}_${dataAtual}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  limparFiltros(): void {
    this.filtros = {
      recursoId: undefined,
      dataInicio: '',
      dataFim: ''
    };
  }
}
