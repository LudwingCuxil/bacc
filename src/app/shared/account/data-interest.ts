import { Account } from 'backoffice-ace/src/app/core/deposits-core/shared/account';
import { MethodPayment } from '../../method-payment/shared/method-payment.model';
import { Frecuencia } from './frequency';
export class DatoInteres {
  cuentaPago = new Account();
  formaPago = new MethodPayment();
  frecuencia = new Frecuencia();
}
