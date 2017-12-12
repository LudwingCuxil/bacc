import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import { SecurityService } from 'security-angular/src/app/security';
import { AccountSummary } from '../../../shared/account/account-summary';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AccountInformationService {

  private informationURL: string = environment.apiUrl + '/api/cuentas/';

  constructor(private securityService: SecurityService) { }

  getAccountSummay(numeroCuenta: string): Promise<AccountSummary> {
    return this.securityService.get(this.informationURL + numeroCuenta + '/portal')
      .then((response) => response.json() as AccountSummary)
      .catch(this.handleError);
  }

  getEndPoint(): string {
    return this.informationURL;
  }

  setEndPoint(url: string): void {
    this.informationURL = url;
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
