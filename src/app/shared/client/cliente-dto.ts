/*
 * To change this license header; choose License Headers in Project Properties.
 * To change this template file; choose Tools | Templates
 * and open the template in the editor.
 * created by oscar cisneros oscarcisneros8@gmail.com
 */

import {ClienteResumen} from './cliente-resumen';
import {Authorized} from '../../authorization/shared/authorization';
import {DatosAdicionales} from './datos-adicionales';
import {DatosGeneralesPersonaJuridica} from './datos-generales-persona-juridica';
import {DatosGeneralesPersonaNatural} from './datos-generales-persona-natural';
import {Direccion} from './direccion';
import {OpeningDocument} from './documento-apertura';
import {OficialDeCuentas} from './oficial-de-cuentas';
import {Nacionalidad} from './nacionalidad';
import {PerfilEconomico} from './perfil-economico';
import {Referencia} from './referencia';
import {RepresetanteLegalTutor} from './representante-legal-tutor';
import {DocumentoIdentificacion} from './documento-identificacion';

export class ClienteDto {

  autorizaciones: Authorized[] = [];
  clienteResumen: ClienteResumen = new ClienteResumen();
  datosAdicionales: DatosAdicionales = new DatosAdicionales();
  datosGeneralesPersonaJuridica: DatosGeneralesPersonaJuridica = new DatosGeneralesPersonaJuridica();
  datosGeneralesPersonaNatural: DatosGeneralesPersonaNatural = new DatosGeneralesPersonaNatural();
  direcciones: Direccion[] = [];
  documentosApertura: OpeningDocument[] = [];
  oficialDeCuentas: OficialDeCuentas = new OficialDeCuentas();
  paisOrigen: Nacionalidad = new Nacionalidad();
  perfilEconomico: PerfilEconomico = new PerfilEconomico();
  referencias: Referencia = new Referencia();
  representanteLegalTutor: RepresetanteLegalTutor = new RepresetanteLegalTutor();
  tipoDocumento: string;
  identificacion: string;
  documento: string;
  fecha: any;
  tipoPersona: string;
  tipoIdentificacion: DocumentoIdentificacion = new DocumentoIdentificacion();
  numeroIdentificacion: string;
  tipoDeIdentificacion: string;
}

