package com.reservas.service;

import com.reservas.dto.request.RecursoRequestDto;
import com.reservas.model.Recurso;

import java.util.List;

public interface IRecursoService {

    Recurso salvar (RecursoRequestDto dto);

    Recurso buscarPorId (Long id);

    List<Recurso> buscarPorNome (String nome);

    Recurso buscarPorCodigoIdentificacao(String codigoIdentificacao);

    List<Recurso> buscarPorTipoId(Long tipoId);

    List<Recurso> buscarTodos();

    void deletar (Long id);

}
