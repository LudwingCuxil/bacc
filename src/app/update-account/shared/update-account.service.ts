import {Injectable} from '@angular/core';

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {AccountDto} from '../../shared/account/account-dto';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UpdateAccountService {

  private updateNameURL: string = environment.apiUrl + '/api/cuentas/';

  constructor(private securityService: SecurityService) {
  }

  getUpdateName(identificacion: string): Promise<AccountDto> {
    return this.securityService.get(this.updateNameURL + identificacion + '/nombre')
      .then((response) => response.json() as AccountDto)
      .catch(this.handleError);
  }

  applyAutorization(): Promise<any> {
    return this.securityService.post(this.updateNameURL + 'permiso/cambioNombre')
      .then(response => response.json() as any)
      .catch(this.handleError);
  }

  updateName(identification: string, account: AccountDto): Promise<AccountDto> {
    const body = JSON.stringify(account);
    return this.securityService.put(this.updateNameURL + identification + '/nombre', body)
      .then(response => response.json() as AccountDto)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
