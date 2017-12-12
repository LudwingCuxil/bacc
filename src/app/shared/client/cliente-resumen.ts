/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import {TypePerson} from '../account/type-person.enum';
import {ClientId} from '../account/client-id';
import {TypeClass} from '../account/type-class';
import {ClientStatus} from '../account/client-status.enum';

export class ClienteResumen {
  public id?: ClientId;
  public nombre?: string;
  public tipoPersona?: TypePerson;
  public tipoDeIdentificacion?: string;
  public numeroIdentificacion?: string;
  public identificacionTributaria?: string;
  public clase?: TypeClass;
  public estado?: ClientStatus;
  public descripcionEstado?: string;
  public descripcionTipoDeIdentificacion?: string;
  public fechaNacimiento?: Date;
  public relacion?: string;
}


