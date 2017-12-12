import { ClienteResumen } from '../client/cliente-resumen';
import {RelationshipAccount} from '../account/account-dto';
export class PersonaMancomunada extends RelationshipAccount{
  cliente = new ClienteResumen();
  relacion  = 0;
  relacionIncluyente = false;
  tipoIdentificacion = '';
  identificacion = '';
}
