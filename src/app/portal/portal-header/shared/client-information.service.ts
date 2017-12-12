import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';

import {SecurityService} from 'security-angular/src/app/security';

import {environment} from '../../../../environments/environment';
import {ClienteResumen} from '../../../shared/client/cliente-resumen';
import {ClientInformation} from '../../../shared/account/client-information.model';

@Injectable()
export class ClientInformationService {

  private informationURL: string = environment.apiUrl + '/api/clientes/';

  constructor(private securityService: SecurityService) {}

  getInformationByClient(identificacion: string): Promise<ClienteResumen> {
    return this.securityService.get(this.informationURL + identificacion + '/portal')
      .then((response) => response.json() as ClienteResumen)
      .catch(this.handleError);
  }
  
  async getInformationClient(identificacion: string): Promise<ClientInformation> {
    const response = await this.securityService.get(this.informationURL + identificacion);
      return response.json() as ClientInformation;
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
