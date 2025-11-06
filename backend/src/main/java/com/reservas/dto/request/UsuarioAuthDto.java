package com.reservas.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UsuarioAuthDto {

    @NotBlank(message = "Informe o nome de usuário.")
    private String nomeUsuario;

    @NotBlank(message = "Informe a senha.")
    private String senha;

}
