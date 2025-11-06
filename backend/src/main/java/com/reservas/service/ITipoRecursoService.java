package com.reservas.service;

import com.reservas.model.TipoRecurso;

import java.util.List;

public interface ITipoRecursoService {

    TipoRecurso salvar(TipoRecurso tipoRecurso);

    TipoRecurso buscarPorId(Long id);

    TipoRecurso buscarPorNome(String nome);

    List<TipoRecurso> buscarTodos();

    void deletar(Long id);

}
