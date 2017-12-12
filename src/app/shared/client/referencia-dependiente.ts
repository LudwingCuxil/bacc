/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Parentesco} from './parentesco';
import {ReferenceDTO} from './referenceDTO';
export class ReferenciaDependiente extends ReferenceDTO {

  correlativo: number;
  nombre: string;
  direccion: string;
  parentesco: Parentesco;
  telefono1: string;
  telefono2 = '';
  parentescoDescripcion = '';
  
  constructor(correlativo?: number,
              nombre?: string,
              direccion?: string,
              parentesco?: Parentesco,
              telefono1?: string,
              telefono2?: '',
              parentescoDescripcion?: '') {
    super();
    this.correlativo = null;
    this.nombre = null;
    this.direccion = null;
    this.parentesco = new Parentesco();
    this.telefono1 = null;
    this.telefono2 = null;
    this.parentescoDescripcion = null;
  }
}
