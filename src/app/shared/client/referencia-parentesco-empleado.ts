/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {EjecutivoNegocio} from './ejecutivo-negocio';
import {Parentesco} from './parentesco';
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaParentescoEmpleado extends ReferenceDTO {
  guardada : boolean;
  empleado = new EjecutivoNegocio();
  parentesco = new Parentesco();
  codigoEmpleado : number;
  
  constructor() {
    super();
  }
}
