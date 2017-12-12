/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com / i God i trust
 */
import {Institucion} from './institucion';
import {Moneda} from './moneda';

import {TipoInstitucion} from './tipo-institucion';
import {ReferenceDTO} from './referenceDTO';

export class ReferenciaSeguro extends ReferenceDTO {
  correlativoReferencia: number
  certificado = '';
  cobertura = '';
  endoso = '';
  fechaVencimiento: Date;
  guardada: boolean;
  institucion = new Institucion();
  codigoAseguradora: number;
  moneda = new Moneda();
  tipoInstitucion = new TipoInstitucion();
  poliza = '';
  tipoDePoliza: string;

}




