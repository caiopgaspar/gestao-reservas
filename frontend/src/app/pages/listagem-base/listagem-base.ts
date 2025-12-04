import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-listagem-base',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Template será extendido pelos componentes específicos -->
  `
})
export abstract class ListagemBaseComponent<T, F> implements OnInit, OnDestroy {

  // Dados da listagem
  items: T[] = [];

  // Formulário de filtros
  filtroForm!: FormGroup;

  // Estados
  carregando = false;
  carregandoLista = false;

  // Controle de subscriptions
  protected destroy$ = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    protected router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Métodos abstratos que cada componente deve implementar
  protected abstract inicializarFormulario(): void;
  protected abstract carregarItems(filtros?: F): void;
  protected abstract getNomeRotaCadastro(): string;

  // Configura comportamento dos filtros
  private configurarFiltros(): void {
    // Debounce para evitar muitas requisições enquanto digita
    this.filtroForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        // Se o formulário for válido e tiver valores, aplica filtros
        if (this.filtroForm.valid && this.temFiltrosPreenchidos()) {
          this.aplicarFiltros();
        }
      });
  }

  // Verifica se há filtros preenchidos
  protected temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }

  // Aplicar filtros
  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      const filtros = this.filtroForm.value;
      this.carregarItems(filtros);
    }
  }

  // Limpar filtros
  limparFiltros(): void {
    this.filtroForm.reset();
    this.items = []; // Limpa a listagem quando limpa filtros
  }

  // Navegar para cadastro
  navegarParaCadastro(): void {
    this.router.navigate([this.getNomeRotaCadastro()]);
  }

  // Navegar para edição
  navegarParaEdicao(id: number): void {
    this.router.navigate([this.getNomeRotaCadastro(), id]);
  }
}
