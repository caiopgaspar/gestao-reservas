package com.reservas.service;

import com.reservas.dto.request.ReservaRequestDto;
import com.reservas.model.Recurso;
import com.reservas.model.Reserva;
import com.reservas.model.Usuario;
import com.reservas.model.enums.StatusReservaEnum;
import com.reservas.repository.ReservaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ReservaService implements IReservaService{

    private final ReservaRepository reservaRepository;
    private final IUsuarioService usuarioService;
    private final IRecursoService recursoService;

    public ReservaService(ReservaRepository reservaRepository, IUsuarioService usuarioService, IRecursoService recursoService) {
        this.reservaRepository = reservaRepository;
        this.usuarioService = usuarioService;
        this.recursoService = recursoService;
    }

    @Override
    public Reserva buscarPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva com o ID " + id + " não encontrada."));
    }

    @Override
    public List<Reserva> buscarTodas() {
        List<Reserva> reservas = reservaRepository.findAll();
        reservas.forEach(this::atualizarStatusAutomatico);
        return reservas;
    }

    @Override
    public List<Reserva> buscarComFiltros(Long usuarioId, Long recursoId) {
        List<Reserva> reservas = reservaRepository.buscarPorFiltros(usuarioId, recursoId);
        reservas.forEach(this::atualizarStatusAutomatico);
        return reservas;
    }

    @Override
    public List<Reserva> buscarReservaPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioIdOrderByDataHoraInicioAsc(usuarioId);
    }

    @Override
    public List<Reserva> buscarReservasPorRecurso(Long recursoId) {
        // Usa o Repository para buscar todas as reservas daquele recurso.
        return reservaRepository.findByRecursoIdOrderByDataHoraInicioAsc(recursoId);
    }

    @Override
    public List<Reserva> verificarConflito(Long recursoId, LocalDateTime inicio, LocalDateTime fim, Long idReservaAtual) {
        return reservaRepository.findReservasConflitantes(
                recursoId,
                inicio,
                fim,
                idReservaAtual
        );
    }

    @Override
    @Transactional
    public Reserva salvar(ReservaRequestDto dto) {

        if (dto.getDataHoraInicio().isAfter(dto.getDataHoraFim()) || dto.getDataHoraInicio().isEqual(dto.getDataHoraFim())) {
            throw new IllegalArgumentException("A data/hora de início deve ser anterior à data/hora de fim.");
        }

        Usuario usuario = usuarioService.buscarPorId(dto.getUsuarioId());
        Recurso recurso = recursoService.buscarPorId(dto.getRecursoId());

        List<Reserva> conflitos = verificarConflito(
                dto.getRecursoId(),
                dto.getDataHoraInicio(),
                dto.getDataHoraFim(),
                dto.getId()
        );

        if (!conflitos.isEmpty()) {
            throw new IllegalStateException("Já existe outra reserva no período.");
        }

        Reserva reserva = dto.getId() != null ? buscarPorId(dto.getId()) : new Reserva();
        
        if (reserva.getStatus() == StatusReservaEnum.CANCELADA) {
            throw new IllegalStateException("Não é possível editar uma reserva cancelada.");
        }

        reserva.setUsuario(usuario);
        reserva.setRecurso(recurso);
        reserva.setDataHoraInicio(dto.getDataHoraInicio());
        reserva.setDataHoraFim(dto.getDataHoraFim());
        reserva.setFinalidade(dto.getFinalidade());

        if (reserva.getId() == null) {
            reserva.setStatus(StatusReservaEnum.AGENDADA);
        } else {
            atualizarStatusAutomatico(reserva);
        }

        return reservaRepository.save(reserva);
    }

    @Override
    @Transactional
    public void atualizarStatus(Long id, StatusReservaEnum novoStatus) {
        Reserva reserva = buscarPorId(id);
        
        if (reserva.getStatus() == StatusReservaEnum.CANCELADA) {
            throw new IllegalStateException("Não é possível alterar o status de uma reserva cancelada.");
        }
        
        reserva.setStatus(novoStatus);
        reservaRepository.save(reserva);
    }

    private void atualizarStatusAutomatico(Reserva reserva) {
        LocalDateTime agora = LocalDateTime.now();
        
        if (reserva.getDataHoraFim().isBefore(agora) && reserva.getStatus() == StatusReservaEnum.AGENDADA) {
            reserva.setStatus(StatusReservaEnum.REALIZADA);
            reservaRepository.save(reserva);
        }
    }

    @Override
    public void deletar(Long id) {
        Reserva reserva = buscarPorId(id);
        reservaRepository.delete(reserva);
    }
}
