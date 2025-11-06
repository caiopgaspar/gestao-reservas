package com.reservas.repository;

import com.reservas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNomeUsuaroi(String nomeUsuario);

    Optional<Usuario> findByMatricula(String matricula);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByNomeCompletoContainingIgnoreCase(String nomeCompleto);

}
