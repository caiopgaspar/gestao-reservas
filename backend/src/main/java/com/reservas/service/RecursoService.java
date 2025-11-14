package com.reservas.service;

import com.reservas.dto.request.RecursoRequestDto;
import com.reservas.model.Recurso;
import com.reservas.model.TipoRecurso;
import com.reservas.repository.RecursoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class RecursoService implements IRecursoService{

    private final RecursoRepository recursoRepository;
    private final ITipoRecursoService tipoRecursoService;

    public RecursoService(RecursoRepository recursoRepository, ITipoRecursoService tipoRecursoService) {
        this.recursoRepository = recursoRepository;
        this.tipoRecursoService = tipoRecursoService;
    }

    @Override
    public Recurso buscarPorId(Long id) {
        return recursoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tipo de recurso com ID " + id + " não encontrado."));
    }

    @Override
    public List<Recurso> buscarPorNome(String nome) {
        if (nome == null || nome.trim().isEmpty()){
            return recursoRepository.findAll();
        }
        return recursoRepository.findByNomeContainingIgnoreCase(nome);
    }

    @Override
    public Recurso buscarPorCodigoIdentificacao(String codigoIdentificacao) {
        return recursoRepository.findByCodigoIdentificacao(codigoIdentificacao);
    }

    @Override
    public List<Recurso> buscarPorTipoId(Long tipoId) {
        return recursoRepository.findByTipoId(tipoId);
    }

    @Override
    public List<Recurso> buscarTodos() {
        return recursoRepository.findAll();
    }

    @Override
    @Transactional
    public Recurso salvar(RecursoRequestDto dto) {

        Recurso recursoExistente = buscarPorCodigoIdentificacao(dto.getCodigoIdentificacao());

        if (recursoExistente != null){

            boolean isNovoRecurso = dto.getId() == null;
            boolean isOutroRecurso = !recursoExistente.getId().equals(dto.getId());

            if (isNovoRecurso || isOutroRecurso){
                throw new IllegalArgumentException("Já existe um Recurso cadastrado com o código de identificação " + dto.getCodigoIdentificacao());
            }
        }

        TipoRecurso tipo = tipoRecursoService.buscarPorId(dto.getTipoRecursoId());

        Recurso recurso = new Recurso(
                dto.getNome(),
                dto.getCodigoIdentificacao(),
                dto.getLocalizacao(),
                dto.getCapacidade(),
                tipo
        );

        if (dto.getId() != null) {
            recurso.setId(dto.getId());
        }

        return recursoRepository.save(recurso);
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        Recurso recurso = buscarPorId(id);
        recursoRepository.delete(recurso);
    }
}
