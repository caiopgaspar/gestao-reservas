package com.reservas.dto.request;

import com.reservas.model.enums.StatusReservaEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ReservaRequestDto {

    private Long id;

    @NotBlank(message = "A data e hora de início são obrigatórias.")
    @DateTimeFormat()
    private LocalDateTime dataHoraInicio;

    @NotBlank(message = "A data e hora final são obrigatórias.")
    @DateTimeFormat()
    private LocalDateTime dataHoraFim;

    @Size(max = 150, message = "Máximo de 150 caracteres.")
    private String finalidade;

    @NotBlank(message = "O status da reserva é obrigatório.")
    private StatusReservaEnum status;

    @NotBlank(message = "O Recurso é obrigatório.")
    private Long recursoId;

    @NotBlank(message = "O usuário é obrigatório.")
    private Long usuarioId;

}
