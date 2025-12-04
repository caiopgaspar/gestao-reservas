import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TipoRecurso as TipoRecursoInterface, TipoRecursoService } from '../../services/tipo-recurso';

@Component({
  selector: 'app-tipo-recurso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
    // Inicialmente não carrega tipos - espera usuário aplicar filtros
    this.mostrarInstrucoes = true;
    this.filtrosAplicados = false;
  }

  carregarTiposRecurso(): void {
    this.carregandoLista = true;
    this.mostrarInstrucoes = false;
    this.filtrosAplicados = true;

    const filtros = this.filtroForm.value;

    // Remove valores vazios/nulos
    const filtrosLimpos: any = {};
    if (filtros.nome && filtros.nome.trim() !== '') {
      filtrosLimpos.nome = filtros.nome.trim();
    }

    console.log('Buscando tipos de recurso com filtros:', filtrosLimpos);

    // Como seu backend não tem endpoint com filtros, vamos buscar todos e filtrar no frontend
    this.tipoRecursoService.buscarTodos().subscribe({
      next: (tipos) => {
        // Filtra no frontend se houver nome no filtro
        if (filtrosLimpos.nome) {
          const nomeBusca = filtrosLimpos.nome.toLowerCase();
          this.tiposRecurso = tipos.filter(tipo =>
            tipo.nome.toLowerCase().includes(nomeBusca)
          );
        } else {
          this.tiposRecurso = tipos;
        }

        this.carregandoLista = false;
        console.log(`${this.tiposRecurso.length} tipos de recurso encontrados`);
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar tipos de recurso:', erro);
        alert('Erro ao carregar tipos de recurso');
        this.carregandoLista = false;
      }
    });
  }

  aplicarFiltros(): void {
    if (this.filtroForm.valid) {
      this.carregarTiposRecurso();
    }
  }

  limparFiltros(): void {
    this.filtroForm.reset();
    this.tiposRecurso = [];
    this.filtrosAplicados = false;
    this.mostrarInstrucoes = true;
  }

  navegarParaCadastro(): void {
    this.router.navigate(['/tipo-recurso/cadastro']);
  }

  navegarParaEdicao(id: number): void {
    this.router.navigate(['/tipo-recurso/cadastro', id]);
  }

  deletarTipoRecurso(id: number): void {
    if (!confirm('Tem certeza que deseja excluir este tipo de recurso?')) {
      return;
    }

    this.tipoRecursoService.deletar(id).subscribe({
      next: () => {
        alert('Tipo de recurso excluído com sucesso!');
        // Recarrega os dados mantendo os filtros atuais
        this.carregarTiposRecurso();
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao excluir tipo de recurso:', erro);

        let mensagemErro = 'Erro ao excluir tipo de recurso';

        // ✅ Mensagens de erro mais específicas
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

  // Verifica se há algum filtro preenchido
  temFiltrosPreenchidos(): boolean {
    const values = this.filtroForm.value;
    return Object.values(values).some(val =>
      val !== null && val !== undefined && val !== ''
    );
  }

  // Se quiser implementar edição inline (sem mudar de página)
  editarTipoRecurso(tipo: TipoRecursoInterface): void {
    // Aqui você pode implementar edição inline se preferir
    // Ou usar o método navegarParaEdicao(tipo.id!)
    this.navegarParaEdicao(tipo.id!);
  }
}
