/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {Parentesco} from './parentesco';
import {ReferenceDTO} from './referenceDTO';

export class ReferenciaPersonalFamiliar extends ReferenceDTO {

  correlativoReferencia: number;
  direccion: string;
  guardada: boolean;
  nombre: string;
  telefonoCasa = '';
  telefonoOficina = '';
  parentesco = new Parentesco();

}
