import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TipoRecurso as TipoRecursoInterface, TipoRecursoService } from '../../services/tipo-recurso';

@Component({
  selector: 'app-tipo-recurso-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './tipo-recurso-cadastro.html',
  styleUrls: ['./tipo-recurso-cadastro.css']
})
export class TipoRecursoCadastro implements OnInit {

  public tipoRecursoForm: FormGroup;
  public salvando = false;
  public editando = false;
  public tipoRecursoId?: number;
  public carregando = false;

  constructor(
    private tipoRecursoService: TipoRecursoService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.tipoRecursoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    // Verificar se é edição
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editando = true;
        this.tipoRecursoId = +params['id'];
        this.carregarTipoRecurso(this.tipoRecursoId);
      }
    });
  }

  carregarTipoRecurso(id: number): void {
    this.carregando = true;
    this.tipoRecursoService.buscarPorId(id).subscribe({
      next: (tipo: TipoRecursoInterface) => {
        this.tipoRecursoForm.patchValue({
          nome: tipo.nome,
          descricao: tipo.descricao || ''
        });
        this.carregando = false;
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar tipo de recurso:', erro);
        alert('Erro ao carregar tipo de recurso');
        this.carregando = false;
        this.router.navigate(['/tipo-recurso']);
      }
    });
  }

  onSubmit(): void {
    // ✅ Validação mais robusta
    if (this.tipoRecursoForm.invalid || this.salvando) {
      this.marcarCamposComoSujos();
      return;
    }

    this.salvando = true; // ✅ Desabilita o botão durante o salvamento

    const tipoRecurso: TipoRecursoInterface = {
      nome: this.tipoRecursoForm.value.nome.trim(),
      descricao: this.tipoRecursoForm.value.descricao?.trim() || ''
    };

    // Se for edição, adiciona o ID
    if (this.editando && this.tipoRecursoId) {
      tipoRecurso.id = this.tipoRecursoId;
    }

    console.log('Tentando salvar:', tipoRecurso); // ✅ Debug

    const operacao = this.editando && this.tipoRecursoId
      ? this.tipoRecursoService.atualizar(this.tipoRecursoId, tipoRecurso)
      : this.tipoRecursoService.salvar(tipoRecurso);

    operacao.subscribe({
      next: (tipoSalvo) => {
        console.log('Salvo com sucesso:', tipoSalvo); // ✅ Debug
        alert(`Tipo de Recurso ${this.editando ? 'atualizado' : 'cadastrado'} com sucesso!`);
        this.router.navigate(['/tipo-recurso']);
      },
      error: (erro: HttpErrorResponse) => {
        console.error('Erro detalhado ao salvar:', erro);
        let mensagemErro = `Erro ao ${this.editando ? 'atualizar' : 'cadastrar'} tipo de recurso`;

        // ✅ Mensagens de erro mais específicas
        if (erro.status === 400) {
          mensagemErro = 'Dados inválidos. Verifique os campos.';
        } else if (erro.status === 409) {
          mensagemErro = 'Já existe um tipo de recurso com este nome.';
        } else if (erro.error?.message) {
          mensagemErro = erro.error.message;
        }

        alert(mensagemErro);
        this.salvando = false; // ✅ Reabilita o botão mesmo em caso de erro
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/tipo-recurso']);
  }

  private marcarCamposComoSujos(): void {
    Object.keys(this.tipoRecursoForm.controls).forEach(key => {
      this.tipoRecursoForm.get(key)?.markAsTouched();
    });
  }
}
