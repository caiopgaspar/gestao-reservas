import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReservaService, ReservaResponseDto, ReservaRequestDto, FiltroReserva, StatusReservaEnum } from '../../services/reserva';
import { RecursoService, RecursoResponseDto } from '../../services/recurso';
import { UsuarioService, UsuarioResponseDto } from '../../services/usuario';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reserva-cadastro',
  imports: [],
  templateUrl: './reserva-cadastro.html',
  styleUrl: './reserva-cadastro.css',
})
export class ReservaCadastro {

}
