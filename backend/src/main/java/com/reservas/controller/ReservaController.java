package com.reservas.controller;

import com.reservas.dto.request.ReservaRequestDto;
import com.reservas.dto.response.ReservaResponseDto;
import com.reservas.model.Reserva;
import com.reservas.model.enums.StatusReservaEnum;
import com.reservas.repository.ReservaRepository;
import com.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/reserva")
public class ReservaController {

    public final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping("{id}")
    public ResponseEntity<ReservaResponseDto> buscarPorId(@PathVariable Long id){
        Reserva reserva = reservaService.buscarPorId(id);
        ReservaResponseDto responseDto = new ReservaResponseDto(reserva);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<ReservaResponseDto>> buscar(
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) Long recursoId
    ){
        List<Reserva> reservas = reservaService.buscarComFiltros(usuarioId, recursoId);

        List<ReservaResponseDto> responseList = reservas.stream()
                .map(ReservaResponseDto::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<ReservaResponseDto> criar(@Valid @RequestBody ReservaRequestDto dto){
        Reserva novaReserva = reservaService.salvar(dto);
        ReservaResponseDto responseDto = new ReservaResponseDto((novaReserva));
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponseDto> atualiza(@PathVariable Long id,
                                                       @Valid @RequestBody ReservaRequestDto dto){
        dto.setId(id);
        Reserva reservaAtualizada = reservaService.salvar(dto);
        ReservaResponseDto responseDto = new ReservaResponseDto((reservaAtualizada));
        return ResponseEntity.ok(responseDto);
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<ReservaResponseDto> cancelar(@PathVariable Long id){
        reservaService.atualizarStatus(id, StatusReservaEnum.CANCELADA);
        Reserva reserva = reservaService.buscarPorId(id);
        ReservaResponseDto responseDto = new ReservaResponseDto(reserva);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        reservaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

}
