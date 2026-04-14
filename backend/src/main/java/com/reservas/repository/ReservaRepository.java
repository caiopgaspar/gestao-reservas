package com.reservas.repository;

import com.reservas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT r FROM Reserva r " +
            "WHERE r.recurso.id = :recursoId " +
            "AND r.status IN ('AGENDADA', 'REALIZADA') " +
            "AND (:inicio < r.dataHoraFim AND :fim > r.dataHoraInicio)" +
            "AND (:idReservaAtual IS NULL OR r.id != :idReservaAtual)"
    )
    List<Reserva> findReservasConflitantes(
            @Param("recursoId") Long recursoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim")LocalDateTime fim,
            @Param("idReservaAtual") Long idReservaAtual
            );

    @Query("SELECT r FROM Reserva r WHERE " +
            "(:usuarioId IS NULL OR r.usuario.id = :usuarioId) AND " +
            "(:recursoId IS NULL OR r.recurso.id = :recursoId) " +
            "ORDER BY r.dataHoraInicio ASC")
    List<Reserva> buscarPorFiltros(
            @Param("usuarioId") Long usuarioId,
            @Param("recursoId") Long recursoId
            );

    List<Reserva> findByUsuarioIdOrderByDataHoraInicioAsc(Long usuarioId);

    List<Reserva> findByRecursoIdOrderByDataHoraInicioAsc(Long recursoId);

    List<Reserva> findByRecursoIdAndDataHoraFimAfterAndDataHoraInicioBefore(
            Long recursoId,
            LocalDateTime periodoInicio,
            LocalDateTime periodoFim
    );

}
