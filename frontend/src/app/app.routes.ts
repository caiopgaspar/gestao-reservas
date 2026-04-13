import { Routes } from '@angular/router';
import { TipoRecurso } from './pages/tipo-recurso/tipo-recurso';
import { TipoRecursoCadastro } from './pages/tipo-recurso-cadastro/tipo-recurso-cadastro';
import { Recurso } from './pages/recurso/recurso';
import { RecursoCadastro } from './pages/recurso-cadastro/recurso-cadastro';
import { Usuario } from './pages/usuario/usuario';
import { UsuarioCadastro } from './pages/usuario-cadastro/usuario-cadastro';
import { Reserva } from './pages/reserva/reserva';
import { ReservaCadastro } from './pages/reserva-cadastro/reserva-cadastro';
import { Index } from './pages/index/index';
import { Login } from './pages/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Relatorio } from './pages/relatorio/relatorio';


export const routes: Routes = [

  { path: 'index', component: Index },

  { path: 'tipo-recurso', component: TipoRecurso },
  { path: 'tipo-recurso/cadastro', component: TipoRecursoCadastro },
  { path: 'tipo-recurso/cadastro/:id', component: TipoRecursoCadastro },

  { path: 'recurso', component: Recurso },
  { path: 'recurso/cadastro', component: RecursoCadastro },
  { path: 'recurso/cadastro/:id', component: RecursoCadastro },

  { path: 'usuario', component: Usuario,canActivate: [AuthGuard] },
  { path: 'usuario/cadastro', component: UsuarioCadastro },
  { path: 'usuario/cadastro/:id', component: UsuarioCadastro, canActivate: [AuthGuard] },

  { path: 'reserva', component: Reserva },
  { path: 'reserva/cadastro', component: ReservaCadastro },
  { path: 'reserva/cadastro/:id', component: ReservaCadastro },

  { path: 'login', component: Login },

  { path: 'relatorios', component: Relatorio },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
