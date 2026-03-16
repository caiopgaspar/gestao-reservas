package com.reservas.service;

import com.reservas.dto.request.ReservaRequestDto;
import com.reservas.model.Reserva;

import java.time.LocalDateTime;
import java.util.List;

public interface IReservaService {

    Reserva buscarPorId (Long id);

    List<Reserva> buscarTodas();
    
    List<Reserva> buscarComFiltros(Long usuarioId, Long recursoId);

    List<Reserva> buscarReservaPorUsuario(Long usuarioId);

    List<Reserva> buscarReservasPorRecurso(Long recursoId);

    List<Reserva> verificarConflito(Long recursoId, LocalDateTime inicio, LocalDateTime fim, Long idReservaAtual);

    Reserva salvar (ReservaRequestDto dto);

    void deletar (Long id);

}
