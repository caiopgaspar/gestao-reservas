package com.reservas.controller;

import com.reservas.dto.request.RecursoRequestDto;
import com.reservas.dto.response.RecursoResponseDto;
import com.reservas.model.Recurso;
import com.reservas.service.IRecursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recurso")
public class RecursoController {

    private final IRecursoService recursoService;

    public RecursoController(IRecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recurso> buscarPorId(@PathVariable Long id){
        Recurso recurso = recursoService.buscarPorId(id);
        RecursoResponseDto responseDto = new RecursoResponseDto(recurso);
        return ResponseEntity.ok(recurso);
    }

    @GetMapping
    public ResponseEntity<List<RecursoResponseDto>> buscar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) Long tipoId   ) {

        List<Recurso> recursos;

        if (tipoId != null) {
            recursos = recursoService.buscarPorTipoId(tipoId);
        } else if (nome != null && !nome.trim().isEmpty()) {
            recursos = recursoService.buscarPorNome(nome);
        } else {
            recursos = recursoService.buscarTodos();
        }

        List<RecursoResponseDto> responseList = recursos.stream()
                .map(RecursoResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Recurso> buscarPorCodigoIdentificacao(@PathVariable("codigo")String codigoIdentificacao){
        Recurso recurso = recursoService.buscarPorCodigoIdentificacao(codigoIdentificacao);
        return ResponseEntity.ok(recurso);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Recurso> criar(@Valid @RequestBody RecursoRequestDto dto){
        Recurso novoRecurso = recursoService.salvar(dto);
        RecursoResponseDto responseDto = new RecursoResponseDto(novoRecurso);
        return new ResponseEntity<>(novoRecurso, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recurso> atualizar(@PathVariable Long id,
                                             @Valid @RequestBody RecursoRequestDto dto){
        dto.setId(id);
        Recurso recursoAtualizado = recursoService.salvar(dto);
        RecursoResponseDto responseDto = new RecursoResponseDto(recursoAtualizado);
        return ResponseEntity.ok(recursoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Recurso> deletar(@PathVariable Long id){
        recursoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
