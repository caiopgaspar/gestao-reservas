import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../core/config';

export interface UsuarioRequestDto {
  id?: number;
  matricula: string;
  nomeCompleto: string;
  nomeUsuario: string;
  senha?: string;
  email: string;
  lotacao: string;
}

export interface UsuarioAuthDto {
  nomeUsuario: string;
  senha: string;
}

export interface UsuarioResponseDto {
  id: number;
  matricula: string;
  nomeCompleto: string;
  nomeUsuario: string;
  email: string;
  lotacao: string;
}

export interface FiltroUsuario {
  nomeCompleto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl = `${AppConfig.apiUrl}/usuario`;

  constructor(private http: HttpClient) { }

  /**
   * Busca um usuário por ID
   */
  public buscarPorId(id: number): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca usuário por nome de usuário
   */
  public buscarPorNomeUsuario(nomeUsuario: string): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.apiUrl}/nome-usuario/${nomeUsuario}`);
  }

  /**
   * Busca usuário por matrícula
   */
  public buscarPorMatricula(matricula: string): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.apiUrl}/matricula/${matricula}`);
  }

  /**
   * Busca usuário por email
   */
  public buscarPorEmail(email: string): Observable<UsuarioResponseDto> {
    return this.http.get<UsuarioResponseDto>(`${this.apiUrl}/email/${email}`);
  }

  /**
   * Busca usuários com filtros opcionais
   */
  public buscar(filtros?: FiltroUsuario): Observable<UsuarioResponseDto[]> {
    let params = new HttpParams();

    if (filtros?.nomeCompleto) {
      params = params.set('nomeCompleto', filtros.nomeCompleto);
    }

    return this.http.get<UsuarioResponseDto[]>(this.apiUrl, { params });
  }

  /**
   * Busca todos os usuários
   */
  public buscarTodos(): Observable<UsuarioResponseDto[]> {
    return this.http.get<UsuarioResponseDto[]>(this.apiUrl);
  }

  /**
   * Cria um novo usuário
   */
  public cadastrar(usuario: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http.post<UsuarioResponseDto>(`${this.apiUrl}/cadastro`, usuario);
  }

  /**
   * Atualiza um usuário existente
   */
  public atualizar(id: number, usuario: UsuarioRequestDto): Observable<UsuarioResponseDto> {
    return this.http.put<UsuarioResponseDto>(`${this.apiUrl}/${id}`, usuario);
  }

  /**
   * Realiza login
   */
  public login(authData: UsuarioAuthDto): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/login`, authData, { responseType: 'text' as 'json' });
  }

  /**
   * Deleta um usuário
   */
  public deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca usuários por nome
   */
  public buscarPorNome(nomeCompleto: string): Observable<UsuarioResponseDto[]> {
    return this.buscar({ nomeCompleto });
  }
}
