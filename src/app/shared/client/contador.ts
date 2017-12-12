/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Nacionalidad} from './nacionalidad';
import {DocumentoIdentificacion} from './documento-identificacion';
import {ReferenceDTO} from './referenceDTO';

export class Contador extends ReferenceDTO  {

  direccion = '';
  nacionalidad = new Nacionalidad();
  nombre = '' ;
  numeroIdentificacion ='';
  telefono1 = '';
  telefono2 = '';
  tipoIdentificacion = new DocumentoIdentificacion();
}

