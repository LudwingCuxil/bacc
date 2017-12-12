import { Agency } from '../../agencies-select/shared/agencies-select.model';
import { PersonaChequera } from './checkbook-person';
import { TipoChequera } from './checkbook-type';
export class DatoChequera{
  agenciaEntrega = new Agency();
  cantidad = 1;
  chequeraPersonalizada = false;
  direccion = '';
  nombre = '';
  personasAutorizadas: PersonaChequera[] = [];
  telefono = '';
  tipoChequera = new TipoChequera();
}
