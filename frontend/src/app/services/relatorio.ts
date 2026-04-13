import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../core/config';

export interface FiltroRelatorio {
  recursoId?: number;
  dataInicio?: string;
  dataFim?: string;
  usuarioId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  private readonly apiUrl = `${AppConfig.apiUrl}/relatorios`;

  constructor(private http: HttpClient) { }

  /**
   * Gera relatório de recursos
   */
  public gerarRelatorioRecursos(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/recursos`, {
      responseType: 'blob'
    });
  }

  /**
   * Gera relatório de reservas com filtros
   */
  public gerarRelatorioReservas(filtros?: FiltroRelatorio): Observable<Blob> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.recursoId) {
        params = params.set('recursoId', filtros.recursoId.toString());
      }
      if (filtros.dataInicio) {
        params = params.set('dataInicio', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        params = params.set('dataFim', filtros.dataFim);
      }
      if (filtros.usuarioId) {
        params = params.set('usuarioId', filtros.usuarioId.toString());
      }
    }

    return this.http.get(`${this.apiUrl}/reservas`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Gera relatório de reservas por período
   */
  public gerarRelatorioPorPeriodo(dataInicio: string, dataFim: string): Observable<Blob> {
    return this.gerarRelatorioReservas({ dataInicio, dataFim });
  }

  /**
   * Gera relatório de reservas por recurso
   */
  public gerarRelatorioPorRecurso(recursoId: number): Observable<Blob> {
    return this.gerarRelatorioReservas({ recursoId });
  }
}
