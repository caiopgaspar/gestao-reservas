import { Routes } from '@angular/router';
import { TipoRecurso } from './pages/tipo-recurso/tipo-recurso';
import { TipoRecursoCadastro } from './pages/tipo-recurso-cadastro/tipo-recurso-cadastro';
import { Recurso } from './pages/recurso/recurso';
import { RecursoCadastro } from './pages/recurso-cadastro/recurso-cadastro';
import { Usuario } from './pages/usuario/usuario';
import { Reserva } from './pages/reserva/reserva';
import { Index } from './pages/index/index';
import { Login } from './pages/login/login';


export const routes: Routes = [

  { path: 'index', component: Index },

  { path: 'tipo-recurso', component: TipoRecurso },
  { path: 'tipo-recurso/cadastro', component: TipoRecursoCadastro },
  { path: 'tipo-recurso/cadastro/:id', component: TipoRecursoCadastro },

  { path: 'recurso', component: Recurso },
  { path: 'recurso/cadastro', component: RecursoCadastro },

  { path: 'usuario', component: Usuario },

  { path: 'reserva', component: Reserva },

  { path: 'login', component: Login },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
