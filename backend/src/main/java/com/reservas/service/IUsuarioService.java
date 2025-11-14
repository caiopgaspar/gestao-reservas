package com.reservas.service;

import com.reservas.dto.request.UsuarioAuthDto;
import com.reservas.dto.request.UsuarioRequestDto;
import com.reservas.model.Usuario;

import java.util.List;

public interface IUsuarioService {

    Usuario salvar (UsuarioRequestDto dto);

    Usuario buscarPorId (Long id);

    Usuario buscarPorNomeUsuario (String nomeUsuario);

    List<Usuario> buscarTodos();

    List<Usuario> buscarPorNome(String nomeCompleto);

    Usuario buscarPorMatricula (String matricula);

    Usuario buscarPorEmail (String email);

    String autenticar(UsuarioAuthDto authDto);

    void validarDuplicidade(String matricula, String nomeUsuario, String email);

    void deletar (Long id);

}
