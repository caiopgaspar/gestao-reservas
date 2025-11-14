package com.reservas.controller;

import com.reservas.dto.request.UsuarioAuthDto;
import com.reservas.dto.request.UsuarioRequestDto;
import com.reservas.dto.response.UsuarioResponseDto;
import com.reservas.model.Usuario;
import com.reservas.service.IUsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/usuario")
public class UsuarioController {

    private final IUsuarioService usuarioService;

    public UsuarioController(IUsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(@PathVariable Long id){
        Usuario usuario = usuarioService.buscarPorId(id);
        UsuarioResponseDto responseDto = new UsuarioResponseDto(usuario);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/nome-usuario/{nomeUsuario}")
    public ResponseEntity<Usuario> buscarPorNomeUsuario(@PathVariable String nomeUsuario){
        Usuario usuario = usuarioService.buscarPorNomeUsuario(nomeUsuario);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<Usuario> buscarPorMatricula(@PathVariable String matricula){
        Usuario usuario = usuarioService.buscarPorMatricula(matricula);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Usuario> buscarPorEmail(@PathVariable String email){
        Usuario usuario = usuarioService.buscarPorEmail(email);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDto>> buscar(
            @RequestParam(required = false) String nomeCompleto
    ) {
        List<Usuario> usuarios;

        if (nomeCompleto != null && !nomeCompleto.trim().isEmpty()) {
            usuarios = usuarioService.buscarPorNome(nomeCompleto);
        } else {
            usuarios = usuarioService.buscarTodos();
        }

        List<UsuarioResponseDto> responseList = usuarios.stream()
                .map(UsuarioResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList); // Retorna 200 OK
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDto dto
    ){
        dto.setId(id);
        Usuario usuarioAtualizado = usuarioService.salvar(dto);
        UsuarioResponseDto responseDto = new UsuarioResponseDto(usuarioAtualizado);
        return ResponseEntity.ok(usuarioAtualizado);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Usuario> cadastrar(@Valid @RequestBody UsuarioRequestDto dto){
        Usuario novoUsuario = usuarioService.salvar(dto);
        UsuarioResponseDto responseDto = new UsuarioResponseDto(novoUsuario);
        return new ResponseEntity<>(novoUsuario, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody UsuarioAuthDto authDto){
        String tokenOuMensagem = usuarioService.autenticar(authDto);
        return ResponseEntity.ok(tokenOuMensagem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Usuario> deletar(@PathVariable Long id){
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
