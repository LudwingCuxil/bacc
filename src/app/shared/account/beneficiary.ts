import {DocumentoIdentificacion} from '../client/documento-identificacion';
import {Parentesco} from '../client/parentesco';
import { RelationshipAccount } from './account-dto';

export class Beneficiario extends RelationshipAccount{
  apellidoCasada = '';
  correlativo = 0;
  direccion = '';
  numeroDocumento = '';
  parentesco: Parentesco = new Parentesco();
  porcentaje = 0;
  primerApellido = '';
  primerNombre = '';
  segundoApellido = '';
  segundoNombre = '';
  telefono = '';
  tipoDocumento: DocumentoIdentificacion = new DocumentoIdentificacion();
  composeName = '';
  parentescoDescripcion = '';
}
