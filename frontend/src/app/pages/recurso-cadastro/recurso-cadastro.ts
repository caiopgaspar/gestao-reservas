import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RecursoService, RecursoRequestDto } from '../../services/recurso';
import { TipoRecursoService, TipoRecurso } from '../../services/tipo-recurso';

@Component({
  selector: 'app-recurso-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recurso-cadastro.html',
  styleUrls: ['./recurso-cadastro.css']
})
export class RecursoCadastro implements OnInit {

  recursoForm: FormGroup;
  tiposRecurso: TipoRecurso[] = [];

  editando = false;
  recursoId?: number;
  carregando = false;
  carregandoTipos = false;

  constructor(
    private recursoService: RecursoService,
    private tipoRecursoService: TipoRecursoService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.recursoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      codigoIdentificacao: ['', [Validators.required, Validators.maxLength(50)]],
      localizacao: ['', [Validators.maxLength(200)]],
      capacidade: ['', [Validators.min(1)]],
      tipoRecursoId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarTiposRecurso();

    // Verificar se é edição
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editando = true;
        this.recursoId = +params['id'];
        this.carregarRecurso(this.recursoId);
      }
    });
  }

  carregarTiposRecurso(): void {
    this.carregandoTipos = true;
    this.tipoRecursoService.buscarTodos().subscribe({
      next: (tipos) => {
        this.tiposRecurso = tipos;
        this.carregandoTipos = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar tipos de recurso:', erro);
        alert('Erro ao carregar tipos de recurso');
        this.carregandoTipos = false;
      }
    });
  }

  carregarRecurso(id: number): void {
    this.carregando = true;
    this.recursoService.buscarPorId(id).subscribe({
      next: (recurso) => {
        this.recursoForm.patchValue({
          nome: recurso.nome,
          codigoIdentificacao: recurso.codigoIdentificacao,
          localizacao: recurso.localizacao || '',
          capacidade: recurso.capacidade || '',
          tipoRecursoId: recurso.tipoRecursoId
        });
        this.carregando = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar recurso:', erro);
        alert('Erro ao carregar recurso');
        this.carregando = false;
        this.router.navigate(['/recurso']);
      }
    });
  }

  onSubmit(): void {
    if (this.recursoForm.invalid) {
      this.marcarCamposComoSujos();
      return;
    }

    this.carregando = true;
    const recursoData: RecursoRequestDto = this.recursoForm.value;

    const operacao = this.editando && this.recursoId
      ? this.recursoService.atualizar(this.recursoId, recursoData)
      : this.recursoService.criar(recursoData);

    operacao.subscribe({
      next: () => {
        alert(`Recurso ${this.editando ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.router.navigate(['/recurso']);
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao salvar recurso:', erro);
        alert(`Erro ao ${this.editando ? 'atualizar' : 'cadastrar'} recurso`);
        this.carregando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/recurso']);
  }

  private marcarCamposComoSujos(): void {
    Object.keys(this.recursoForm.controls).forEach(key => {
      this.recursoForm.get(key)?.markAsTouched();
    });
  }
}
