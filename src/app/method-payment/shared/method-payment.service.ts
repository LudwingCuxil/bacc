import { Injectable } from "@angular/core";
import { SecurityService } from 'security-angular/src/app/security/shared/security.service';
import { environment } from "../../../environments/environment";

@Injectable()
export class MethodPaymentService {
  methodPaymentURL = environment.apiUrl + '/api/cuentas/campos';

  constructor(private securityService: SecurityService) {}

  getMethodPayments(product: number, subProduct: number, pager?: any): Promise<any> {
     return this.securityService.get(this.methodPaymentURL+'?campo=VALOR_APERTURA&producto='+product+'&subProducto='+subProduct)
       .then((response) => response)
       .catch(this.handleError);
  }

  private handleError(error?: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
