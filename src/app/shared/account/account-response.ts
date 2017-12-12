import {ClienteResumen} from '../client/cliente-resumen';
import {ServicioElectronico} from './electronic-service';
export class AccountResponse {
  digitoIdentificador: number;
  agencia : number;
  correlativo: number;
  digitoVerificador: number;
  moneda: string;
  tipoProducto: string;
  producto: string;
  numeroCuenta: string;
  nombre: string;
  estado: string;
  personasAsociadas: ClienteResumen[];
  serviciosElectronicos: ServicioElectronico[];
}