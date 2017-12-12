/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Profesion} from './profesion';
import {DocumentoIdentificacion} from './documento-identificacion';

export class RepresetanteLegalTutor {

  primerApellido?: string = '';
  segundoApellido = '';
  apellidoCasada = '';
  primerNombre?: string = '';
  segundoNombre = '';
  tipoIdentificacion?: DocumentoIdentificacion = new DocumentoIdentificacion();
  identificacion?: string = '';
  telefono1?: string = '';
  telefono2 = '';
  direccion?: string = '';
  profesion?: Profesion = new Profesion();
  fechaNombramiento?: Date = null;
  nombre?: string = '';
  registraRepresentanteLegal?: boolean = false;
}
