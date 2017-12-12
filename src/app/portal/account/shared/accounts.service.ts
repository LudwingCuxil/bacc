import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security/shared/security.service';
import {AccountsCoreService} from 'backoffice-ace/src/app/core/deposits-core/shared/accounts-core.service';
import {environment} from '../../../../environments/environment';

@Injectable()
export class AccountsService extends AccountsCoreService {

  private accountsUrl: string = environment.apiUrl + '/api/cuentas';

  constructor(private securityServiceAccounts: SecurityService) {
    super (securityServiceAccounts);
    super.setEndpoint(this.accountsUrl);
  }

}
