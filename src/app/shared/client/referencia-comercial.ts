/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaComercial extends ReferenceDTO {
  direccion: string;
  guardada: boolean;
  nombre: string;
  relacion: boolean;
  telefono1: string;
  telefono2 = '';
}
