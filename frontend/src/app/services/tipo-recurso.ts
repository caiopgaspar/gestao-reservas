import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../core/config';

export interface TipoRecurso {
  id?: number;
  nome: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class TipoRecursoService {

  private readonly apiUrl = `${AppConfig.apiUrl}/tipo-recurso`;

  constructor(private http: HttpClient) { }

  public buscarPorId(id: number): Observable<TipoRecurso> {
      return this.http.get<TipoRecurso>(`${this.apiUrl}/${id}`);
  }

  public buscarTodos(): Observable<TipoRecurso[]> {
    return this.http.get<TipoRecurso[]>(this.apiUrl);
  }

  public buscar(filtros?: any): Observable<TipoRecurso[]> {
      return this.buscarTodos().pipe(
        map(tipos => {
          if (!filtros || !filtros.nome) {
            return tipos;
          }

          const nomeBusca = filtros.nome.toLowerCase();
          return tipos.filter(tipo =>
            tipo.nome.toLowerCase().includes(nomeBusca)
          );
        })
      );
  }

  public atualizar(id: number, tipoRecurso: TipoRecurso): Observable<TipoRecurso> {
      return this.http.put<TipoRecurso>(`${this.apiUrl}/${id}`, tipoRecurso);
  }

  public salvar(tipo: TipoRecurso): Observable<TipoRecurso> {
    return this.http.post<TipoRecurso>(this.apiUrl, tipo);
  }

  public deletar(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }

}
