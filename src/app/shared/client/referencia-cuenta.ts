/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {TipoInstitucion} from './tipo-institucion';
import {Institucion} from './institucion';
import {ReferenceDTO} from './referenceDTO';

export class ReferenciaCuenta extends ReferenceDTO {

  correlativoReferencia: number;
  aperturaAproximada: Date;
  guardada: boolean;
  institucion = new Institucion();
  numeroCuenta: string;
  codigoNumeroCuenta: string;
  codigoTipoInstitucion: number;
  codigoInstitucion: number;
  tipo: string;
  tipoInstitucion = new TipoInstitucion();

}



