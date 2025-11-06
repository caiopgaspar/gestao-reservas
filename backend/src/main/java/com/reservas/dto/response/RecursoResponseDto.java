package com.reservas.dto.response;

import com.reservas.model.Recurso;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RecursoResponseDto {

    private Long id;
    private String nome;
    private String codigoIdentificacao;
    private String localizacao;
    private Integer capacidade;

    //TipoRecurso
    private Long tipoRecursoId;
    private String nomeTipoRecurso;


    public RecursoResponseDto (Recurso recurso){
        this.id = recurso.getId();
        this.nome = recurso.getNome();
        this.codigoIdentificacao = recurso.getCodigoIdentificacao();
        this.localizacao = recurso.getLocalizacao();
        this.capacidade = recurso.getCapacidade();
        if (recurso.getTipo() != null){
            this.tipoRecursoId = recurso.getTipo().getId();
            this.nomeTipoRecurso = recurso.getTipo().getNome();
        }
    }

}
