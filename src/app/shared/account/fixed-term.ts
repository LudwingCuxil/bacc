import { AccountSummary } from './account-summary';
import { FormaPagoInteres } from './interest-method-payment';
export class PlazoFijo{
  cuentaPagoCapital = new AccountSummary();
  debita = false;
  debitarCuenta = new AccountSummary();
  formaPagoCapital = new FormaPagoInteres();
  monto = 0;
  plazoDias = null;
  renovacionAutomatica = true;
  tasa = 0;
  tasaPenalizacion = 0;
  vencimiento: Date = null;
}

export class Deadline {
  descripcion: string = '';
  id: number = 0;
  orden: number = 0;
  valor: string = '';
  version: number = 0;
}