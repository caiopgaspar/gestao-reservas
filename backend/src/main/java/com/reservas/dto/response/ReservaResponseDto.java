package com.reservas.dto.response;

import com.reservas.model.Reserva;
import com.reservas.model.enums.StatusReservaEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter

public class ReservaResponseDto {

    private Long id;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String finalidade;
    private StatusReservaEnum status;

    //Recurso
    private Long recursoId;
    private String nomeRecurso;
    private String codigoRecurso;

    //Usuario
    private Long usuarioId;
    private String nomeCompleto;
    private String nomeUsuario;
    private String matriculaUsuario;


    public  ReservaResponseDto (Reserva reserva){
        this.id = reserva.getId();
        this.dataHoraInicio = reserva.getDataHoraInicio();
        this.dataHoraFim = reserva.getDataHoraFim();
        this.finalidade = reserva.getFinalidade();
        this.status = reserva.getStatus();

        if (reserva.getRecurso() != null){
            this.recursoId = reserva.getRecurso().getId();
            this.nomeRecurso = reserva.getRecurso().getNome();
            this.codigoRecurso = reserva.getRecurso().getCodigoIdentificacao();
        }

        if (reserva.getUsuario() != null) {
            this.usuarioId = reserva.getUsuario().getId();
            this.nomeCompleto = reserva.getUsuario().getNomeCompleto();
            this.nomeUsuario = reserva.getUsuario().getNomeCompleto();
            this.matriculaUsuario = reserva.getUsuario().getMatricula();
        }
    }

}
