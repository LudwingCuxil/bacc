/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ClaseReferencia} from './clase-referencia';
import {Institucion} from './institucion';
import {TipoInstitucion} from './tipo-institucion';
import {ReferenceDTO} from './referenceDTO';


export class ReferenciaCredito extends ReferenceDTO {
  correlativoReferencia: number;
  claseRefencia = new ClaseReferencia();
  fechaConcesion: Date;
  fechaVencimiento: Date;
  guardada: boolean;
  institucion = new Institucion();
  limite: string;
  numero: string;
  tipoInstitucion = new TipoInstitucion();
}

