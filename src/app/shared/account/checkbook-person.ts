import { DocumentoIdentificacion } from '../client/documento-identificacion';
import {RelationshipAccount} from './account-dto';
export class PersonaChequera extends RelationshipAccount{
  nombre = '';
  numeroDocumento = '';
  tipoDocumento = new DocumentoIdentificacion();
  editable = false;
  valorTipoDocumento = '';
  valorNumeroDocumento = '';
}
