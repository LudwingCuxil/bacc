import {TypePerson} from './type-person.enum';
import {ClientStatus} from './client-status.enum';
import {DireccionCliente} from './client-direction';
import { ClienteResumen } from '../client/cliente-resumen';

export class ClientInformation {

  constructor(public tipoIdentificacion?: string,
              public identificacion?: string,
              public nombre?: string,
              public tipoPersona?: TypePerson,
              public afectoISR?: boolean,
              public idenTributaria?: string,
              public estado?: ClientStatus,
              public empresa?: string,
              public agencia?: number,
              public supervisor?: number,
              public ejecutivoNegocio?: number,
              public sectorEconomico?: number,
              public fechaAlta?: Date,
              public existenciaEnListaNegra?: boolean,
              public representanteLegal?: string,
              public claseClienteCodigo?: number,
              public claseClienteDescripcion?: string,
              public numeroIdentificacion?: string,
              public limiteEndeudamiento?: number,
              public tipoDeIdentificacion?: string,
              public actividadEconomica?: number,
              public paisOrigen?: string,
              public estadoPapeleria?: string,
              public direcciones?: DireccionCliente[],
              public datoRepresentanteLegal?: ClienteResumen){
  }
}
