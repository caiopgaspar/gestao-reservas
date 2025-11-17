package com.reservas.service;

import com.reservas.exception.ResourceInUseException;
import com.reservas.model.TipoRecurso;
import com.reservas.repository.TipoRecursoRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TipoRecursoService implements ITipoRecursoService{

    private final TipoRecursoRepository tipoRecursoRepository;

    public TipoRecursoService(TipoRecursoRepository tipoRecursoRepository){
        this.tipoRecursoRepository = tipoRecursoRepository;
    }

    @Override
    public TipoRecurso buscarPorId(Long id) {
        return tipoRecursoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tipo de recurso com ID " + id + " não encontrado."));
    }

    @Override
    public TipoRecurso buscarPorNome(String nome) {
        return tipoRecursoRepository.findByNome(nome);
    }

    @Override
    public List<TipoRecurso> buscarTodos() {
        return tipoRecursoRepository.findAll();
    }

    @Override
    @Transactional
    public TipoRecurso salvar(TipoRecurso tipoRecurso) {
        if (tipoRecurso.getId() == null){
            TipoRecurso existente = buscarPorNome(tipoRecurso.getNome());
            if (existente != null){
                throw new IllegalArgumentException("Já existe um Tipo de Recurso com este nome.");
            }
        }
        return tipoRecursoRepository.save(tipoRecurso);
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        TipoRecurso tipoRecurso = buscarPorId(id);
        try {
            tipoRecursoRepository.deleteById(id);
            tipoRecursoRepository.flush();
        } catch (DataIntegrityViolationException e) {
            String nomeTipoRecurso = tipoRecurso.getNome();
            throw new ResourceInUseException("Não é possível excluir o Tipo de Recurso (" + nomeTipoRecurso + ") pois ele está vinculado a um ou mais Recursos");
        }
    }

}
