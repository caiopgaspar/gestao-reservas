package com.reservas.controller;

import com.reservas.model.TipoRecurso;
import com.reservas.service.ITipoRecursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-recurso")
public class TipoRecursoController {

    private final ITipoRecursoService tipoRecursoService;

    public TipoRecursoController(ITipoRecursoService tipoRecursoService) {
        this.tipoRecursoService = tipoRecursoService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoRecurso> buscarPorId (@PathVariable Long id){
        TipoRecurso tipoRecurso = tipoRecursoService.buscarPorId(id);
        return ResponseEntity.ok(tipoRecurso);
    }

    @GetMapping
    public ResponseEntity<List<TipoRecurso>> buscarTodos (){
        List<TipoRecurso> tipos = tipoRecursoService.buscarTodos();
        return ResponseEntity.ok(tipos);
    }

    @PostMapping
    public ResponseEntity<TipoRecurso> criar(@Valid @RequestBody TipoRecurso tipoRecurso){
        TipoRecurso novoTipoRecurso = tipoRecursoService.salvar(tipoRecurso);
        return new ResponseEntity<>(novoTipoRecurso, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoRecurso> atualizar (@PathVariable Long id,
                                                  @Valid @RequestBody TipoRecurso tipoRecurso
    ){
        tipoRecurso.setId(id);
        TipoRecurso tipoRecursoAtualizado = tipoRecursoService.salvar(tipoRecurso);
        return ResponseEntity.ok(tipoRecursoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        tipoRecursoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
