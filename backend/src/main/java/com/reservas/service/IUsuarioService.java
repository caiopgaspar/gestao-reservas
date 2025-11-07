package com.reservas.service;

import com.reservas.dto.request.UsuarioRequestDto;
import com.reservas.model.Usuario;

import java.util.List;

public interface IUsuarioService {

    Usuario salvar (UsuarioRequestDto dto);

    Usuario buscarPorId (Long id);

    Usuario buscarPorNomeUsuario (String nomeUsuario);

    Usuario buscarPorMatricula (String matricula);

    Usuario buscarPorEmail (String email);

    void validarDuplicidade(String matricula, String nomeUsuario);

    void deletar (Long id);

}
