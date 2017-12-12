import {SecurityService} from 'security-angular/src/app/security';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ClienteDto} from '../client/cliente-dto';

@Injectable()
export class LockServices {
  accountsUrl = environment.apiUrl + '/api';

  constructor(private securityService: SecurityService) {
  }

  aquireLock(client: ClienteDto): Promise<any> {
    const body = { tipoIdentificacion: client.tipoIdentificacion, identificacion: client.identificacion};
    return this.securityService.post(this.accountsUrl + '/acquireLock', JSON.stringify(body))
      .then(response => response.json())
      .catch(this.handleError);
  }

  cancelLock(client: ClienteDto): Promise<Date> {
    const body = { tipoIdentificacion: client.tipoIdentificacion, identificacion: client.identificacion};
    return this.securityService.post(this.accountsUrl + '/cancelLock', JSON.stringify(body))
      .then(response => response)
      .catch(this.handleError);
  }


  deleteAllLock(): Promise<any> {
    return this.securityService.delete(`${this.accountsUrl}/deleteAllLock`)
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
