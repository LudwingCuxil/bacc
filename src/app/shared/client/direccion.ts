/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {TipoDireccion} from './tipo-direccion';
import {Zona} from './zona';
import {Ruta} from './ruta';
import {ReferenceDTO} from './referenceDTO';
export class Direccion extends ReferenceDTO {

  antiguedad: Date;
  apartadoPostal = '';
  codigoPostal = '';
  correlativoDireccion: number;
  direccion: string;
  extension = '';
  email = '';
  fax = '';
  nivelGeografico1: number;
  nivelGeografico2: number;
  nivelGeografico3: number;
  nivelGeografico4: number;
  telefono1: string;
  telefono2 = '';
  tipoDireccion = new TipoDireccion();
  ruta = new Ruta();
  zona = new Zona();

  constructor() {
    super();
  }
}






