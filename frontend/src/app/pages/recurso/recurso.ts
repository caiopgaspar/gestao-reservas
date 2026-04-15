import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { TipoRecursoService, TipoRecurso } from '../../services/tipo-recurso';
import { BarraAcoes } from '../barra-acoes/barra-acoes';

@Component({
  selector: 'app-recurso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BarraAcoes],
  templateUrl: './recurso.html',
  styleUrls: ['./recurso.css']
})
export class Recurso implements OnInit {

  recursos: RecursoResponseDto[] = [];
  tiposRecurso: TipoRecurso[] = [];

  filtroForm: FormGroup;
  carregandoLista = false;
  carregandoTipos = false;

  // Flags para controle de UI
  filtrosAplicados = false;
  mostrarInstrucoes = true;

  // Ordenação
  ordenacao: { coluna: string; direcao: 'asc' | 'desc' } = { coluna: '', direcao: 'asc' };

  constructor(
    private recursoService: RecursoService,
    private tipoRecursoService: TipoRecursoService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filtroForm = this.fb.group({
      nome: [''],
      tipoId: ['']
    });
  }

  ngOnInit(): void {
    this.desabilitarCampoTipo();
    this.carregarTiposRecurso();
    this.mostrarInstrucoes = true;
    this.filtrosAplicados = false;
  }

  carregarRecursos(): void {
    this.carregandoLista = true;
    this.mostrarInstrucoes = false;
    this.filtrosAplicados = true;

    const filtros = this.filtroForm.value;

    const filtrosLimpos: any = {};
    if (filtros.nome && filtros.nome.trim() !== '') {
      filtrosLimpos.nome = filtros.nome.trim();
    }
    if (filtros.tipoId && filtros.tipoId !== '') {
      filtrosLimpos.tipoId = filtros.tipoId;
    }

    console.log('Buscando recursos com filtros:', filtrosLimpos);

    setTimeout(() => {
    this.recursoService.buscar(filtrosLimpos).subscribe({
      next: (recursos) => {
        this.recursos = recursos;
        if (this.ordenacao.coluna) {
          this.recursos = this.ordenarLista(this.recursos, this.ordenacao.coluna, this.ordenacao.direcao);
        }
        this.carregandoLista = false;
        console.log(`${recursos.length} recursos encontrados`);
        this.habilitarCamposFiltro();
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar recursos:', erro);
        alert('Erro ao carregar recursos');
        this.carregandoLista = false;
        this.habilitarCamposFiltro();
      }
    });
    }, 500);
  }

  carregarTiposRecurso(): void {
    this.carregandoTipos = true;

    this.tipoRecursoService.buscarTodos().subscribe({
      next: (tipos) => {
        console.log('Tipos carregados:', tipos);
        this.tiposRecurso = tipos;
        this.carregandoTipos = false;
        this.habilitarCampoTipo();
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar tipos de recurso:', erro);
        this.carregandoTipos = false;
        this.desabilitarCampoTipo();
        alert('Não foi possível carregar os tipos de recurso. Por favor, tente novamente.');
        }
    });
  }

  aplicarFiltros(): void {
      if (this.filtroForm.valid) {
        this.desabilitarCamposFiltro();
        this.carregarRecursos();
      }
    }

  limparFiltros(): void {

    this.desabilitarCamposFiltro();

    this.filtroForm.reset();
    this.recursos = [];
    this.filtrosAplicados = false;
    this.mostrarInstrucoes = true;

    if (this.tiposRecurso.length > 0) {
      this.habilitarCamposFiltro();
    }
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/recurso/cadastro']);
  }

  navegarParaEdicao(id: number): void {
    this.router.navigate(['/recurso/cadastro', id]);
  }

  navegarParaInicio(): void {
      this.router.navigate(['/index']);
  }

  deletarRecurso(id: number): void {
    if (confirm('Tem certeza que deseja excluir este recurso? Esta ação não pode ser desfeita.')) {
      this.recursoService.deletar(id).subscribe({
        next: () => {
          alert('Recurso excluído com sucesso!');
          // Recarrega os dados mantendo os filtros atuais
          this.carregarRecursos();
        },
        error: (erro: HttpErrorResponse) => {
          console.error('Erro ao excluir recurso:', erro);

          let mensagem = 'Erro ao excluir recurso';
          if (erro.error?.message) {
            mensagem += `: ${erro.error.message}`;
          } else if (erro.status === 409) {
            mensagem = 'Não é possível excluir o recurso pois ele possui reservas vinculadas.';
          }

          alert(mensagem);
        }
      });
    }
  }

  // Verifica se há algum filtro preenchido
  temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }
   private desabilitarCampoTipo(): void {
      const tipoControl = this.filtroForm.get('tipoId');
      if (tipoControl) {
        tipoControl.disable();
      }
    }

    private habilitarCampoTipo(): void {
      const tipoControl = this.filtroForm.get('tipoId');
      if (tipoControl) {
        tipoControl.enable();
      }
    }

    private desabilitarCamposFiltro(): void {
      // Desabilita todos os campos do formulário
      Object.keys(this.filtroForm.controls).forEach(key => {
        const control = this.filtroForm.get(key);
        if (control) {
          control.disable();
        }
      });
    }

    private habilitarCamposFiltro(): void {
      // Habilita todos os campos do formulário
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

      this.recursos = [...this.ordenarLista(this.recursos, coluna, this.ordenacao.direcao)];
    }

    private ordenarLista(lista: RecursoResponseDto[], coluna: string, direcao: 'asc' | 'desc'): RecursoResponseDto[] {
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

    private getValorCampo(recurso: RecursoResponseDto, coluna: string): any {
      switch (coluna) {
        case 'codigo': return recurso.codigoIdentificacao;
        case 'nome': return recurso.nome;
        case 'tipo': return recurso.nomeTipoRecurso;
        case 'localizacao': return recurso.localizacao;
        case 'capacidade': return recurso.capacidade;
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
