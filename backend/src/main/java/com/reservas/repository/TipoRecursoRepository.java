package com.reservas.repository;

import com.reservas.model.TipoRecurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TipoRecursoRepository extends JpaRepository<TipoRecurso, Long> {

    TipoRecurso findByNome(String nome);

    List<TipoRecurso> findByNomeContainingIgnoreCase(String nome);

}
