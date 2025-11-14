package com.reservas.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class RecursoRequestDto {

    private Long id;

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    @NotBlank(message = "O código de identificação é obrigatório.")
    private String codigoIdentificacao;

    private String localizacao;

    private Integer capacidade;

    @NotNull(message = "O tipo de recurso é obrigatório.")
    private Long tipoRecursoId;

}
