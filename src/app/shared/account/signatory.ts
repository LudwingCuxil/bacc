import { ClienteResumen } from '../client/cliente-resumen';
import { RelationshipAccount } from './account-dto';
export class Firmante extends RelationshipAccount{
  cliente = new ClienteResumen();
  correlativoFirma = 0;
  editable = true;
  observacion = '';
}
