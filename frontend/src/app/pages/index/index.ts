import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class Index {
  public menuItems = [
    { path: '/tipo-recurso', label: 'Tipos de Recurso' }
  ];
}
