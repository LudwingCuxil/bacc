/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * created by oscarcisneros oscarcisneros8@gmail.com
 */
import {ActividadEconomica} from './actividad-economica';
import {DocumentoIdentificacion} from './documento-identificacion';
import {Nacionalidad} from './nacionalidad';
import {ReferenceDTO} from './referenceDTO';

export class ReferenciaAccionista extends ReferenceDTO {
  actividadEconomica = new ActividadEconomica();
  apellidos: string;
  cargo: string;
  correlativoReferencia: number;
  documentoIdentificacion = new DocumentoIdentificacion();
  fechaEgreso: Date;
  fechaIngreso: Date;
  guardada: boolean;
  identificacion: string;
  nacionalidad = new Nacionalidad();
  nombres: string;
  porcentajeParticipacion: number;
  tipoAccionista: string;
}



