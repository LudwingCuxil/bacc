import { ProductId } from './product-id';
import { MethodPayment } from '../../method-payment/shared/method-payment.model';
export class FormaPagoInteres{
  diaPago = 0;
  id = new FormaPagoInteresId()
}

export class FormaPagoInteresId{
  producto = new ProductId();
  tipo = new MethodPayment();
}
