import { Country } from '../../country/shared/country';
import { DocumentoIdentificacion } from '../client/documento-identificacion';
import { RelationshipAccount } from './account-dto';

export class BeneficiarioFinal extends RelationshipAccount{
  apellidoCasada = '';
  celular = '';
  celular2 = '';
  correlativo = 0;
  correo = '';
  departamento = '';
  direccion = '';
  municipio = '';
  nacionalidad = new Country();
  numeroDocumento = '';
  porcentaje = 0;
  primerApellido = '';
  primerNombre = '';
  rtn = '';
  segundoApellido = '';
  segundoNombre = '';
  telefono = '';
  tipoDocumento = new DocumentoIdentificacion();
  composeName = '';
}
