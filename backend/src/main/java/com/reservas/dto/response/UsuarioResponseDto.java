package com.reservas.dto.response;

import com.reservas.model.Usuario;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UsuarioResponseDto {

    private Long id;
    private String matricula;
    private String nomeCompleto;
    private String nomeUsuario;
    private String email;
    private String lotacao;


    public UsuarioResponseDto(Usuario usuario) {
        this.id = usuario.getId();
        this.matricula = usuario.getMatricula();
        this.nomeCompleto = usuario.getNomeCompleto();
        this.nomeUsuario = usuario.getNomeUsuario();
        this.email = usuario.getEmail();
        this.lotacao = usuario.getLotacao();
    }

}
