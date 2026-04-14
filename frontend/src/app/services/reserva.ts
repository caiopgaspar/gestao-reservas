import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../core/config';

export enum StatusReservaEnum {
  AGENDADA = 'AGENDADA',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA'
}

export interface ReservaRequestDto {
  id?: number;
  dataHoraInicio: string; // Formato: "YYYY-MM-DDTHH:mm:ss"
  dataHoraFim: string;    // Formato: "YYYY-MM-DDTHH:mm:ss"
  finalidade?: string;
  recursoId: number;
  usuarioId: number;
}

export interface ReservaResponseDto {
  id: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  finalidade?: string;
  status: StatusReservaEnum;

  // Recurso
  recursoId: number;
  nomeRecurso: string;
  codigoRecurso: string;

  // Usuario
  usuarioId: number;
  nomeCompleto: string;
  nomeUsuario: string;
  matriculaUsuario: string;
}

export interface FiltroReserva {
  usuarioId?: number;
  recursoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private readonly apiUrl = `${AppConfig.apiUrl}/reserva`;

  constructor(private http: HttpClient) { }

  /**
   * Busca uma reserva por ID
   */
  public buscarPorId(id: number): Observable<ReservaResponseDto> {
    return this.http.get<ReservaResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca reservas com filtros opcionais
   */
  public buscar(filtros?: FiltroReserva): Observable<ReservaResponseDto[]> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.usuarioId) {
        params = params.set('usuarioId', filtros.usuarioId.toString());
      }
      if (filtros.recursoId) {
        params = params.set('recursoId', filtros.recursoId.toString());
      }
    }

    return this.http.get<ReservaResponseDto[]>(this.apiUrl, { params });
  }

  /**
   * Busca todas as reservas
   */
  public buscarTodas(): Observable<ReservaResponseDto[]> {
    return this.http.get<ReservaResponseDto[]>(this.apiUrl);
  }

  /**
   * Cria uma nova reserva
   */
  public criar(reserva: ReservaRequestDto): Observable<ReservaResponseDto> {
    console.log('Service - Enviando reserva:', reserva);
    return this.http.post<ReservaResponseDto>(`${this.apiUrl}/cadastro`, reserva);
  }

  /**
   * Atualiza uma reserva existente
   */
  public atualizar(id: number, reserva: ReservaRequestDto): Observable<ReservaResponseDto> {
    console.log('Service - Atualizando reserva:', reserva);
    return this.http.put<ReservaResponseDto>(`${this.apiUrl}/${id}`, reserva);
  }

  /**
   * Deleta uma reserva
   */
  public deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca reservas por usuário
   */
  public buscarPorUsuario(usuarioId: number): Observable<ReservaResponseDto[]> {
    return this.buscar({ usuarioId });
  }

/**
    * Busca reservas por recurso
    */
  public buscarPorRecurso(recursoId: number): Observable<ReservaResponseDto[]> {
    return this.buscar({ recursoId });
  }

  /**
   * Cancela uma reserva (altera status para CANCELADA)
   */
  public cancelar(id: number): Observable<ReservaResponseDto> {
    return this.http.put<ReservaResponseDto>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
