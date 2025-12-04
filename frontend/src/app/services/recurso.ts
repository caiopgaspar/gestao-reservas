import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../core/config';

export interface RecursoRequestDto {
  id?: number;
  nome: string;
  codigoIdentificacao: string;
  localizacao?: string;
  capacidade?: number;
  tipoRecursoId: number;
}

export interface RecursoResponseDto {
  id: number;
  nome: string;
  codigoIdentificacao: string;
  localizacao?: string;
  capacidade?: number;
  tipoRecursoId: number;
  nomeTipoRecurso: string;
}

export interface FiltroRecurso {
  nome?: string;
  tipoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecursoService {

  private readonly apiUrl = `${AppConfig.apiUrl}/recurso`;

  constructor(private http: HttpClient) { }

  /**
   * Busca um recurso por ID
   */
  public buscarPorId(id: number): Observable<RecursoResponseDto> {
    return this.http.get<RecursoResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca recursos com filtros opcionais
   */
  public buscar(filtros?: FiltroRecurso): Observable<RecursoResponseDto[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.nome) {
        params = params.set('nome', filtros.nome);
      }
      if (filtros.tipoId) {
        params = params.set('tipoId', filtros.tipoId.toString());
      }
    }

    return this.http.get<RecursoResponseDto[]>(this.apiUrl, { params });
  }

  /**
   * Busca todos os recursos
   */
  public buscarTodos(): Observable<RecursoResponseDto[]> {
    return this.http.get<RecursoResponseDto[]>(this.apiUrl);
  }

  /**
   * Busca recurso por código de identificação
   */
  public buscarPorCodigoIdentificacao(codigo: string): Observable<RecursoResponseDto> {
    return this.http.get<RecursoResponseDto>(`${this.apiUrl}/codigo/${codigo}`);
  }

  /**
   * Cria um novo recurso
   */
  public criar(recurso: RecursoRequestDto): Observable<RecursoResponseDto> {
    return this.http.post<RecursoResponseDto>(`${this.apiUrl}/cadastro`, recurso);
  }

  /**
   * Atualiza um recurso existente
   */
  public atualizar(id: number, recurso: RecursoRequestDto): Observable<RecursoResponseDto> {
    return this.http.put<RecursoResponseDto>(`${this.apiUrl}/${id}`, recurso);
  }

  /**
   * Deleta um recurso
   */
  public deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca recursos por tipo
   */
  public buscarPorTipo(tipoId: number): Observable<RecursoResponseDto[]> {
    return this.buscar({ tipoId });
  }

  /**
   * Busca recursos por nome
   */
  public buscarPorNome(nome: string): Observable<RecursoResponseDto[]> {
    return this.buscar({ nome });
  }
}
