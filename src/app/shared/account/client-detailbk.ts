import { TypePerson } from './type-person.enum';
import {ClientStatus} from './client-status.enum';
import {ClientId} from './client-id';
import {TypeClass} from './type-class';

export class ClientDetail {

  constructor(public id?: ClientId,
              public nombre?: string,
              public tipoPersona?: TypePerson,
              public tipoDeIdentificacion?: string,
              public numeroIdentificacion?: string,
              public identificacionTributaria?: string,
              public clase?: TypeClass,
              public estado?: ClientStatus,
              public descripcionEstado?: string,
              public fechaNacimiento?: Date){
  }
}
