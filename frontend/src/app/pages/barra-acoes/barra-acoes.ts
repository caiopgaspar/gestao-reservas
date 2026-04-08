import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-barra-acoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-acoes.html',
  styleUrl: './barra-acoes.css',
})
export class BarraAcoes {
  @Input() titulo: string = '';
  @Input() textoBotaoNovo: string = 'Novo';
  @Input() iconBotaoNovo: string = 'bi-plus-square-fill';
  @Input() desabilitarFiltrar: boolean = false;
  @Input() desabilitarNovo: boolean = false;
  @Input() desabilitarLimpar: boolean = false;
  @Input() carregandoFiltrar: boolean = false;
  @Input() textoFiltrar: string = 'Filtrar';
  @Input() textoLimpar: string = 'Limpar';
  @Input() textoFechar: string = 'Fechar';

  @Output() filtrar = new EventEmitter<void>();
  @Output() novo = new EventEmitter<void>();
  @Output() limpar = new EventEmitter<void>();
  @Output() fechar = new EventEmitter<void>();

  onFiltrar(): void {
    this.filtrar.emit();
  }

  onNovo(): void {
    this.novo.emit();
  }

  onLimpar(): void {
    this.limpar.emit();
  }

  onFechar(): void {
    this.fechar.emit();
  }
}
