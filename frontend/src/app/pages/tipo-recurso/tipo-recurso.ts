import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TipoRecurso as TipoRecursoInterface, TipoRecursoService } from '../../services/tipo-recurso';
import { BarraAcoes } from '../barra-acoes/barra-acoes';

@Component({
  selector: 'app-tipo-recurso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BarraAcoes],
  templateUrl: './tipo-recurso.html',
  styleUrls: ['./tipo-recurso.css']
})
export class TipoRecurso implements OnInit {

  public tiposRecurso: TipoRecursoInterface[] = [];
  public filtroForm: FormGroup;

  public carregandoLista = false;
  public carregandoTipos = false;

  // Flags para controle de UI
  public filtrosAplicados = false;
  public mostrarInstrucoes = true;

  // Ordenação
  ordenacao: { coluna: string; direcao: 'asc' | 'desc' } = { coluna: '', direcao: 'asc' };

  constructor(
    private tipoRecursoService: TipoRecursoService,
    private router: Router,
    private fb: FormBuilder
  ) {
    // Formulário de filtros
    this.filtroForm = this.fb.group({
      nome: ['']
    });
  }

  ngOnInit(): void {
    this.desabilitarCampoNome();

    this.mostrarInstrucoes = true;
    this.filtrosAplicados = false;

    setTimeout(() => {
      this.habilitarCampoNome();
    }, 100);
  }

  carregarTiposRecurso(): void {
    this.carregandoLista = true;
    this.mostrarInstrucoes = false;
    this.filtrosAplicados = true;

    this.desabilitarCamposFiltro();

    const filtros = this.filtroForm.value;

    const filtrosLimpos: any = {};
    if (filtros.nome && filtros.nome.trim() !== '') {
      filtrosLimpos.nome = filtros.nome.trim();
    }

    console.log('Buscando tipos de recurso com filtros:', filtrosLimpos);

    setTimeout(() => {
      this.tipoRecursoService.buscarTodos().subscribe({
        next: (tipos) => {
          if (filtrosLimpos.nome) {
            const nomeBusca = filtrosLimpos.nome.toLowerCase();
            this.tiposRecurso = tipos.filter(tipo =>
              tipo.nome.toLowerCase().includes(nomeBusca)
            );
          } else {
            this.tiposRecurso = tipos;
          }

          if (this.ordenacao.coluna) {
            this.tiposRecurso = this.ordenarLista(this.tiposRecurso, this.ordenacao.coluna, this.ordenacao.direcao);
          }

          this.carregandoLista = false;
          console.log(`${this.tiposRecurso.length} tipos de recurso encontrados`);

          this.habilitarCamposFiltro();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao carregar tipos de recurso:', erro);
          alert('Erro ao carregar tipos de recurso');
          this.carregandoLista = false;

          this.habilitarCamposFiltro();
        }
      });
    }, 500); // 500ms de delay
  }

  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      this.carregarTiposRecurso();
    }
  }

  limparFiltros(): void {
    this.desabilitarCamposFiltro();

    this.filtroForm.reset();
    this.tiposRecurso = [];
    this.filtrosAplicados = false;
    this.mostrarInstrucoes = true;

    setTimeout(() => {
      this.habilitarCamposFiltro();
    }, 100);
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/tipo-recurso/cadastro']);
  }

  navegarParaEdicao(id: number): void {
    this.router.navigate(['/tipo-recurso/cadastro', id]);
  }

  navegarParaInicio(): void {
    this.router.navigate(['/index']);
  }

  deletarTipoRecurso(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este tipo de recurso?')) {
      return;
    }

    this.tipoRecursoService.deletar(id).subscribe({
      next: () => {
        alert('Tipo de recurso excluído com sucesso!');

        this.carregarTiposRecurso();
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao excluir tipo de recurso:', erro);

        let mensagemErro = 'Erro ao excluir tipo de recurso';

        if (erro.status === 400) {
          mensagemErro = 'Dados inválidos.';
        } else if (erro.status === 409) {
          mensagemErro = 'Não é possível excluir o tipo de recurso pois ele está vinculado a um ou mais Recursos.';
        } else if (erro.error?.message) {
          mensagemErro = erro.error.message;
        } else if (erro.error) {
          mensagemErro = erro.error;
        }

        alert(mensagemErro);
      }
    });
  }

  temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }

  editarTipoRecurso(tipo: TipoRecursoInterface): void {
    this.navegarParaEdicao(tipo.id!);
  }


  // Métodos para controle de campos

  private desabilitarCampoNome(): void {
    const nomeControl = this.filtroForm.get('nome');
    if (nomeControl) {
      nomeControl.disable();
    }
  }

  private habilitarCampoNome(): void {
    const nomeControl = this.filtroForm.get('nome');
    if (nomeControl && nomeControl.enabled === false) {
      nomeControl.enable();
    }
  }

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
        control.enable();
      }
    });
  }

  ordenar(coluna: string): void {
    if (this.ordenacao.coluna === coluna) {
      this.ordenacao.direcao = this.ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenacao.coluna = coluna;
      this.ordenacao.direcao = 'asc';
    }

    this.tiposRecurso = [...this.ordenarLista(this.tiposRecurso, coluna, this.ordenacao.direcao)];
  }

  private ordenarLista(lista: TipoRecursoInterface[], coluna: string, direcao: 'asc' | 'desc'): TipoRecursoInterface[] {
    return [...lista].sort((a, b) => {
      const aVal = this.getValorCampo(a, coluna);
      const bVal = this.getValorCampo(b, coluna);

      if (aVal === null || aVal === undefined || aVal === '') return 1;
      if (bVal === null || bVal === undefined || bVal === '') return -1;

      let comparacao = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparacao = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparacao = aVal - bVal;
      } else {
        comparacao = String(aVal).localeCompare(String(bVal));
      }

      return direcao === 'asc' ? comparacao : -comparacao;
    });
  }

  private getValorCampo(tipo: TipoRecursoInterface, coluna: string): any {
    switch (coluna) {
      case 'nome': return tipo.nome;
      case 'descricao': return tipo.descricao;
      default: return '';
    }
  }

  getIconeOrdenacao(coluna: string): string {
    if (this.ordenacao.coluna !== coluna) {
      return '';
    }
    return this.ordenacao.direcao === 'asc' ? '↑' : '↓';
  }

}
