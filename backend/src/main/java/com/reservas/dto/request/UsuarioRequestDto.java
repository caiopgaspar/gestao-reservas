package com.reservas.dto.request;

import com.reservas.model.Reserva;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.NumberFormat;

import java.util.List;

@Getter
@Setter

public class UsuarioRequestDto {

    private Long id;

    @NotBlank(message = "A matrícula é obrigatória.")
    @Size(max = 5, message = "A matrícula deve ter no máximo 5 caracteres.")
    @NumberFormat()
    private String matricula;

    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 100, message = "O nome de usuário deve ter no máximo 100 caracteres.")
    private String nomeCompleto;

    @NotBlank(message = "O nome de usuário (login) é obrigatório.")
    private String nomeUsuario;

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 7, message = "A senha deve ter no mínimo 7 caracteres.")
    private String senha;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    private String email;

    @NotBlank(message = "A lotação é obrigatória.")
    private String lotacao;

}
