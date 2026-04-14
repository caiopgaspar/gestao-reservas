package com.reservas.model;

import com.reservas.model.enums.StatusReservaEnum;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reserva")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_hora_inicio", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "data_hora_fim", nullable = false)
    private LocalDateTime dataHoraFim;

    @Column(length = 255)
    private String finalidade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusReservaEnum status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurso_id", nullable = false)
    private Recurso recurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    public Reserva(Recurso recurso, Usuario usuario, LocalDateTime dataHoraInicio, LocalDateTime dataHoraFim, String finalidade){
        this.recurso = recurso;
        this.usuario = usuario;
        this.dataHoraInicio = dataHoraInicio;
        this.dataHoraFim = dataHoraFim;
        this.finalidade = finalidade;
        this.status = StatusReservaEnum.AGENDADA;
    }
}