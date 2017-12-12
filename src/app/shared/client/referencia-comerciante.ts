/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */

import {Contador} from './contador';
import {Direccion} from './direccion';
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaComerciante extends ReferenceDTO {

  correlativoReferencia: number;
  nombreNegocio: string;
  direccion = new Direccion();
  actividadNegocios: string;
  inicioOperaciones: Date;
  ingresosDeNegocioPropio: number;
  codigoDireccion = 0;
  contador = new Contador();

  constructor() {
    super();
  }
}

