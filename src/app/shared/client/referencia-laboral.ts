/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Direccion} from './direccion';
import {Salario} from './salario';
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaLaboral extends ReferenceDTO {

  correlativoReferencia: number;
  nombre: string;
  direccion = new Direccion();
  cargo: string;
  salario = new Salario();
  diaPago = 0 ;
  fechaIngreso: Date;
  fechaEgreso: Date;
  correoElectronico = '';
  codigoDireccion = 0;

  constructor() {
    super();
  }
}


