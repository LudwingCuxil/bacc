import {Injectable} from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security';
import {environment} from '../../../environments/environment';
import {ClienteDto} from '../../shared/client/cliente-dto';

@Injectable()
export class ReferencesService {

  private referencesURL: string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService: SecurityService) {
  }

  getReferencesDependent(identification: string): Promise<ClienteDto> {
    return this.securityService.get(this.referencesURL + identification + '/cambio/dependientes')
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  getReferences(identification: string): Promise<ClienteDto> {
    return this.securityService.get(this.referencesURL + identification + '/cambio/referencias')
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  putReferencesDependent(client: ClienteDto, identification: string): Promise<ClienteDto> {
    const body = JSON.stringify(client);
    return this.securityService.put(this.referencesURL + identification + '/dependientes', body)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  putReferences(client: ClienteDto, identification: string): Promise<ClienteDto> {
    const body = JSON.stringify(client);
    return this.securityService.put(this.referencesURL + identification + '/referencias', body)
      .then((response) => response.json() as ClienteDto)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }
}
