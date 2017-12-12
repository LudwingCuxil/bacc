import { Firmante } from './signatory';
export class Firma{
  condiciones = '';
  firmantes: Firmante[] = [];
  firmasParaGirar = null;
  firmasRegistradas = 0;
}
