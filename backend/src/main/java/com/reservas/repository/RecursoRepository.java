package com.reservas.repository;

import com.reservas.model.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecursoRepository extends JpaRepository<Recurso, Long> {

    Optional<Recurso> findByCodigoIdentificacao(String codigoIdentificacao);

    List<Recurso> findByNomeContainingIgnoreCase(String nome);

    List<Recurso> findByTipoId(Long tipoId);

}
